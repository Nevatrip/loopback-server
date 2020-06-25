// Uncomment these imports to begin using these cool features!

import {inject} from '@loopback/core';
import { NevatravelService, AstramarineService } from '../services';
import { get, param } from '@loopback/rest';
import { parse, format } from 'date-fns';

interface ScheduleResponse {
  partner: 'nevatravel' | 'astramarine'
  direction: 'to' | 'from' | 'both'
  time: string
  tickets: string[]
}

export class PartnerController {
  constructor(
    @inject('services.Nevatravel')
    protected nevatravelService: NevatravelService,
    @inject('services.Astramarine')
    protected astramarineService: AstramarineService,
  ) {}

  @get('/partner/schedule/{direction}/{date}', {
    responses: {
      '200': {
        description: `Return service's shedule on date`,
      },
    },
    summary: `Get service's shedule on date`,
  })
  async getSchedule(
    @param.path.string('direction', { schema: {
      type: 'string',
      default: 'to',
      enum: [ 'to', 'from', 'both' ]
    } }) direction: string,
    @param.path.string('date', { schema: {
      type: 'string',
      default: format( new Date(), 'dd.MM.yyyy'),
    } }) date: string,
  ): Promise<ScheduleResponse[]> {
    const output: ScheduleResponse[] = [];
    const dateInput = parse(date, 'dd.MM.yyyy', new Date() );
    const dateOutput = format( dateInput, 'yyyy-MM-dd');
    const nevatravelService: string = '1223263874329870352';
    const astamarineService: string = '000000004';

    const response = await this.nevatravelService.getСruises(
      nevatravelService,
      dateOutput,
    );

    switch ( direction ) {
      case 'to': {
        response.forEach( item => {
          output.push({
            partner: 'nevatravel',
            direction: 'to',
            time: item.starting_time,
            tickets: [ 'Standard' ]
          })
        } )

        const amResponse = await this.astramarineService.getEvents( {
          dateFrom: dateOutput,
          dateTo: dateOutput,
          serviceID: astamarineService,
        } )

        const amEventsRequest: Promise<ScheduleResponse>[] = amResponse.events.map( async item => {
          const categories = await this.astramarineService.getSeatCategories( { eventID: item.eventID } );
          const time = new Date( item.eventDateTime );

          return {
            partner: 'astramarine',
            direction: 'to',
            time: format( dateInput, 'HH:mm' ),
            tickets: categories.seatCategories.map( category => category.seatCategoryName )
          } as ScheduleResponse
        } )

        const amEvents = await Promise.all( amEventsRequest );

        output.push( ...amEvents );
        break;
      }

      case 'from': {
        const [{ back_cruises: backCruises }] = response;
        backCruises?.forEach( item => {
          const date = new Date( item.starting_time );
          output.push({
            partner: 'nevatravel',
            direction: 'from',
            time: `${ date.getHours() }:${ date.getMinutes() }`,
            tickets: [ 'Standard' ]
          })
        } )
        break;
      }

      case 'both': {
        response.forEach( item => {
          output.push({
            partner: 'nevatravel',
            direction: 'to',
            time: item.starting_time,
            tickets: [ 'Standard' ]
          })
        } )
        const [{ back_cruises: backCruises }] = response;
        backCruises?.forEach( item => {
          const date = new Date( item.starting_time );
          output.push({
            partner: 'nevatravel',
            direction: 'from',
            time: `${ date.getHours() }:${ date.getMinutes() }`,
            tickets: [ 'Standard' ]
          })
        } )
        break;
      }

      default:
        break;
    }

    output.sort( (a, b) => a.time.localeCompare( b.time ) );

    return output;
  }
}
