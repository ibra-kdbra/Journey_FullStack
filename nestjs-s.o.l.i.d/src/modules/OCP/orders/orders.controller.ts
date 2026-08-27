import { Controller } from '@nestjs/common';

import { PaymentService } from '../payment/payment.service';
import { CreditCardGateway, PAYMENT_METHOD } from '../payment/payment.gateway';

@Controller('/orders')
export class OrdersController {
  constructor(private paymentService: PaymentService) {
    this.paymentService.registerPaymentGateway(
      PAYMENT_METHOD.CREDIT_CARD,
      new CreditCardGateway(),
    );
  }
}
