import {inject} from '@loopback/core';
import {
  get,
  post,
  put,
  del,
  param,
  requestBody,
  HttpErrors,
} from '@loopback/rest';
import {NevatravelService} from '../services/nevatravel.service';
import {parse, format} from 'date-fns';
import {NevatravelOrder} from '../models';

const apiKey = process.env.NEVATRAVEL || '';

export class NevatravelController {
  constructor(
    @inject('services.NevatravelService')
    protected nevatravelService: NevatravelService,
  ) {}

  @get('/partner/nevatravel', {
    responses: {
      '200': {
        description: `Service's status and version`,
      },
    },
    summary: `Service's status and version`,
  })
  async getStatus() {
    return await this.nevatravelService.getStatus(apiKey);
  }

  @get('/partner/nevatravel/piers', {
    responses: {
      '200': {
        description: `Piers list`,
      },
    },
    summary: `Piers list`,
  })
  async getPiers() {
    return await this.nevatravelService.getPiers(apiKey);
  }

  @get('/partner/nevatravel/services', {
    responses: {
      '200': {
        description: `Return available programs`,
      },
    },
    summary: `Get available programs`,
  })
  async getPrograms() {
    return await this.nevatravelService.getPrograms(apiKey);
  }

  @get('/partner/nevatravel/services/{service}', {
    responses: {
      '200': {
        description: `Return service's shedule on date`,
      },
    },
    summary: `Get service's shedule on date`,
  })
  async getСruises(
    @param.path.string('service') service: number,
    @param.query.string('date') date: string = format(new Date(), 'dd.MM.yyyy'),
    @param.query.string('pier') pier?: number,
  ) {
    const dateInput = parse(date, 'dd.MM.yyyy', new Date());
    const dateOutput = format(dateInput, 'yyyy-MM-dd');

    return await this.nevatravelService.getСruises(
      apiKey,
      service,
      dateOutput,
      pier,
    );
  }

  @post('/partner/nevatravel/orders', {
    responses: {
      '200': {
        description: `Order created`,
      },
    },
    summary: `Create order`,
  })
  async postOrder(@requestBody() order: NevatravelOrder) {
    if (!order.tickets) {
      throw new HttpErrors.BadRequest(`Tickets is not defined`);
    }

    if (order.tour) {
      await this.nevatravelService.postOrderFixedTime(
        apiKey,
        order.tickets,
        order.tour,
        order.tourBack,
      );
    }

    if (order.date && order.point && order.service) {
      await this.nevatravelService.postOrderOpenTime(
        apiKey,
        order.tickets,
        order.date,
        order.point,
        order.service,
        order.serviceBack,
      );
    }
  }

  @get('/partner/nevatravel/orders/{order}', {
    responses: {
      '200': {
        description: `Return order`,
      },
    },
    summary: `Get order`,
  })
  async getOrder(@param.path.string('order') order: string) {
    return await this.nevatravelService.getOrder(apiKey, order);
  }

  @post('/partner/nevatravel/orders/{order}', {
    responses: {
      '200': {
        description: `Added comment to order`,
      },
    },
    summary: `Add comment to order`,
  })
  async postOrderComment(
    @param.path.string('order') order: string,
    @requestBody() comment: string,
  ) {
    return await this.nevatravelService.postOrderComment(
      apiKey,
      order,
      comment,
    );
  }

  @put('/partner/nevatravel/orders/{order}/approve', {
    responses: {
      '200': {
        description: `Order was approved`,
      },
    },
    summary: `Approve order`,
  })
  async approveOrder(
    @param.path.string('order') order: string,
    @param.query.boolean('requireConfirmation')
    requireConfirmation: boolean = false,
  ) {
    return await this.nevatravelService.approveOrder(
      apiKey,
      order,
      requireConfirmation,
    );
  }

  @del('/partner/nevatravel/orders/{order}', {
    responses: {
      '200': {
        description: `Order was rejected`,
      },
    },
    summary: `Reject order`,
  })
  async rejectOrder(
    @param.path.string('order') order: string,
    @requestBody() comment: string,
  ) {
    return await this.nevatravelService.rejectOrder(apiKey, order, comment);
  }
}
