import TransferInterface from "../../interfaces/TransferInterface";

class StripeTransfer implements TransferInterface {
    transfer($amount: number): boolean {
        /**@toDo implement Strip here */
        return true;
    }
   
}

export default StripeTransfer