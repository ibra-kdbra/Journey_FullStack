import TransferInterface from "../../interfaces/TransferInterface";

class PayPalTransfer implements TransferInterface {
    transfer($amount: number): boolean {
        /** @todo implement PayPal Transfer */
        return true;
    }

}

export default PayPalTransfer