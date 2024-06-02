import TransferInterface from "../../interfaces/TransferInterface";

class TransferManager {
    private transferService: TransferInterface;
    constructor(_transferService: TransferInterface) {
        this.transferService = _transferService;
    }

    transferMoney($amount: number){
        this.transferService.transfer($amount)
    }
}

export default TransferManager