import { Request, Response } from "express";
import { CardPayment, CashPayment, PayPalTransfer } from "../classes";
import { payService } from "../services";
import { EmailHandler, PNHandler, SMSHandler } from "../classes/NotificationHandler";
import TransferManager from "../classes/TransferHandler/TransferManager";


//Task #3 Liskov Substitution 
export const pay = (req: Request, res: Response) => {
    const cash = new CashPayment(20);
    const card = new CardPayment(20);
    // Thrown errors reach the global errorHandler (generic 500, detail logged).
    const amount = payService(card)
    res.json({ "success": true, amount })
}

//Task #4 Interface segregation 
export const sendNotification = (req: Request, res: Response) => {
    const sms = new SMSHandler();
    const email = new EmailHandler();
    const push = new PNHandler();

    const smsSent = sms.handleSMS("SMS message")
    const emailSent = email.handleEmail("Email")
    const pushSent = push.handlePushNotification("Push notification")
    res.json({ "success": true, sent: smsSent && emailSent && pushSent })
}

//Task #5 Dependency inversion 
export const transferMoney = (req: Request, res: Response) => {
    const paypal = new PayPalTransfer();
    const transfer = new TransferManager(paypal) 
    transfer.transferMoney(req.body.amount);
    res.json({ success: true })
}