import { Injectable } from '@nestjs/common';
import { Order } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  public async findOne(orderId: number): Promise<Order> {
    return this.prisma.order.findFirst({ where: { orderId } });
  }
}
