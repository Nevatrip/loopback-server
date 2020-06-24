import { inject } from '@loopback/core';
import { AstramarineService } from '../services';
import { param, get, getModelSchemaRef } from '@loopback/rest';
import { Service, Event } from '../models';

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
  async getEvents() {}

  @get( '/partner/astramarine/events/{id}/categories', {
    responses: {
      '200': {
        description: `Return seats categories on event`,
        content: { 'application/json': { schema: { type: 'array', items: getModelSchemaRef( Event ) } } },
      },
    },
    summary: `Get seats categories on event`,
  } )
  async getSeatCategories() {}

  @get( '/partner/astramarine/events/{id}/seats', {
    responses: {
      '200': {
        description: `Return seats on event`,
        content: { 'application/json': { schema: { type: 'array', items: getModelSchemaRef( Event ) } } },
      },
    },
    summary: `Get seats on event`,
  } )
  async getSeatsOnEvent() {}
}
