import { inject } from '@loopback/core';
import { AstramarineService } from '../services';
import { param, get, getModelSchemaRef } from '@loopback/rest';
import { Service, Event, SeatCategory, Seat } from '../models';

export class AstramarineController {
  constructor(
    @inject( 'services.Astramarine' )
    protected astramarineService: AstramarineService,
  ) {}

  @get( '/partner/astramarine/services', {
    responses: {
      '200': {
        description: `Return services on date`,
        content: { 'application/json': { schema: { type: 'array', items: getModelSchemaRef( Service ) } } },
      },
    },
    summary: `Get services on date`,
  } )
  async getServices(
    @param.query.string( 'dateFrom' ) dateFrom?: string,
    @param.query.string( 'dateTo' ) dateTo?: string,
  ): Promise<Service[]> {
    const response = await this.astramarineService.getServices( { dateFrom, dateTo } );

    return response.services;
  }

  @get( '/partner/astramarine/events', {
    responses: {
      '200': {
        description: `Return events on date`,
        content: { 'application/json': { schema: { type: 'array', items: getModelSchemaRef( Event ) } } },
      },
    },
    summary: `Get events on date`,
  } )
  async getEvents(
    @param.query.string( 'dateFrom' ) dateFrom?: string,
    @param.query.string( 'dateTo' ) dateTo?: string,
    @param.query.string( 'serviceID' ) serviceID?: string,
  ): Promise<Event[]> {
    const response = await this.astramarineService.getEvents( { dateFrom, dateTo, serviceID } )

    return response.events;
  }

  @get( '/partner/astramarine/events/{id}', {
    responses: {
      '200': {
        description: `Return event by id`,
        content: { 'application/json': { schema: getModelSchemaRef( Event ) } },
      },
    },
    summary: `Get event by id`,
  } )
  async getEvent(
    @param.path.string( 'id' ) eventID: string,
  ): Promise<Event> {
    const response = await this.astramarineService.getEvents( { eventID } );
    const [ event ] = response.events;

    return event;
  }

  @get( '/partner/astramarine/events/{id}/categories', {
    responses: {
      '200': {
        description: `Return seats categories on event`,
        content: { 'application/json': { schema: { type: 'array', items: getModelSchemaRef( SeatCategory ) } } },
      },
    },
    summary: `Get seats categories on event`,
  } )
  async getSeatCategories(
    @param.path.string( 'id' ) eventID: string,
  ): Promise<SeatCategory[]> {
    const response = await this.astramarineService.getSeatCategories( { eventID } );

    return response.seatCategories;
  }

  @get( '/partner/astramarine/events/{id}/seats', {
    responses: {
      '200': {
        description: `Return seats on event`,
        content: { 'application/json': { schema: { type: 'array', items: getModelSchemaRef( Seat ) } } },
      },
    },
    summary: `Get seats on event`,
  } )
  async getSeatsOnEvent(
    @param.path.string( 'id' ) eventID: string,
    @param.query.string( 'seatCategoryID' ) seatCategoryID?: string,
  ): Promise<Seat[]> {
    const response = await this.astramarineService.getSeatsOnEvent( { eventID, seatCategoryID } );

    return response.seats
  }
}
