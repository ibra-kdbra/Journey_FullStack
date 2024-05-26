import EmailHandlerInterface from "../../interfaces/NotificationHandler/EmailHandlerInterface";

class EmailHandler implements EmailHandlerInterface{
    handleEmail(message: string): boolean {
        console.log(`implementing Email Handler ${message}`)
        return true
    }

}

export default EmailHandler