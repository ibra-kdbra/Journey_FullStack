import SMSHandlerInterface from "../../interfaces/NotificationHandler/SMSHandlerInterface";

class SMSHandler implements SMSHandlerInterface {
    handleSMS(message: string): boolean {
        console.log(`implementing SMS Handler ${message}`)
        return true
    }

}

export default SMSHandler;