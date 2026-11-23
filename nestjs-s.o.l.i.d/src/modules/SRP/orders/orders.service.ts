import { Injectable } from '@nestjs/common';
import { Order, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async submitOrder(data: Prisma.OrderCreateInput): Promise<Order> {
    const createdOrder = await this.prisma.order.create({ data });
    //Save order on the Database
    //TODO: Add Database saving for order

    return createdOrder;
  }
}
