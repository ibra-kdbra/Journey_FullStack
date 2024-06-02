import PaymentInterface from "../../interfaces/PaymentInterface";

class CashPayment implements PaymentInterface {

    private tax = 12
    amount: number;

    constructor(amount: number) {
        this.amount = amount
    }

    pay(): number {
        this.amount += this.tax;
        /**
         * @todo implement CashPayment login here
         */
        return this.amount
    }
}

export default CashPayment;