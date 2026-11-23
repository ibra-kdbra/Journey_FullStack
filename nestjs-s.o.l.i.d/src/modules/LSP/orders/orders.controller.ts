import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { PricingService } from '../pricing/pricing.service';
import { SalePricingStrategy } from '../pricing/sale-pricing-strategy.service';
import { OrdersService } from './orders.service';

@Controller('/LSP/orders')
export class OrdersController {
  constructor(
    @Inject(SalePricingStrategy)
    private pricingService: PricingService,
    private ordersService: OrdersService,
  ) {}

  @Get('/pricing/:id')
  public async calculateOrderPrice(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ price: number }> {
    const order = await this.ordersService.findOne(id);
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return { price: this.pricingService.calculatePrice(order.totalPrice) };
  }
}
