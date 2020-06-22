// Uncomment these imports to begin using these cool features!

import {inject} from '@loopback/core';
import { NevatravelService } from '../services';
import { get, param } from '@loopback/rest';
import { parse, format } from 'date-fns';

interface ScheduleResponse {
  partner: 'nevatravel' | 'astramarin'
  direction: 'to' | 'from' | 'both'
  time: string;
}

export class PartnerController {
  constructor(
    @inject('services.Nevatravel')
    protected nevatravelService: NevatravelService,
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
    const service: string = '1223263874329870352';

    const response = await this.nevatravelService.getСruises(
      service,
      dateOutput,
    );

    switch ( direction ) {
      case 'to': {
        response.forEach( item => {
          output.push({
            partner: 'nevatravel',
            direction: 'to',
            time: item.starting_time
          })
        } )
        break;
      }

      case 'from': {
        const [{ back_cruises: backCruises }] = response;
        backCruises?.forEach( item => {
          const date = new Date( item.starting_time );
          output.push({
            partner: 'nevatravel',
            direction: 'from',
            time: `${ date.getHours() }:${ date.getMinutes() }`
          })
        } )
        break;
      }

      case 'both': {
        response.forEach( item => {
          output.push({
            partner: 'nevatravel',
            direction: 'to',
            time: item.starting_time
          })
        } )
        const [{ back_cruises: backCruises }] = response;
        backCruises?.forEach( item => {
          const date = new Date( item.starting_time );
          output.push({
            partner: 'nevatravel',
            direction: 'from',
            time: `${ date.getHours() }:${ date.getMinutes() }`
          })
        } )
        break;
      }

      default:
        break;
    }

    return output;
  }
}
