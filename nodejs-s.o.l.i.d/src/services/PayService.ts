import PaymentInterface from "../interfaces/PaymentInterface";

 function payService(paymentService: PaymentInterface) {
    const paidAmount = paymentService.pay()
    return paidAmount;
}

export default payService
