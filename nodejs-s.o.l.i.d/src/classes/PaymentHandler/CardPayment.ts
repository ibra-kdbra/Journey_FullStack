import PaymentInterface from "../../interfaces/PaymentInterface";

class CardPayment implements PaymentInterface {

    private tax = 0
    amount: number;

    constructor(amount: number) {
        this.amount = amount
    }

    pay(): number {
        this.amount += this.tax;
        /**
         * @todo implement CardPayment login here
         */
        return this.amount
    }
}

export default CardPayment;