import { jest } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { SalePricingStrategy } from '../pricing/sale-pricing-strategy.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController (GET /LSP/orders/pricing/:id)', () => {
  let app: INestApplication;
  const findOne = jest.fn();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        SalePricingStrategy,
        { provide: OrdersService, useValue: { findOne } },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => findOne.mockReset());

  it('returns the discounted price for an existing order', async () => {
    findOne.mockResolvedValue({ orderId: 1, totalPrice: 100 });
    const res = await request(app.getHttpServer()).get('/LSP/orders/pricing/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ price: 80 });
    expect(findOne).toHaveBeenCalledWith(1);
  });

  it('returns 404 for an unknown order', async () => {
    findOne.mockResolvedValue(null);
    const res = await request(app.getHttpServer()).get(
      '/LSP/orders/pricing/999',
    );
    expect(res.status).toBe(404);
  });

  it('returns 400 for a non-numeric id', async () => {
    const res = await request(app.getHttpServer()).get(
      '/LSP/orders/pricing/abc',
    );
    expect(res.status).toBe(400);
    expect(findOne).not.toHaveBeenCalled();
  });
});
