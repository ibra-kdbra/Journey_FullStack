import PNHandlerInterface from "../../interfaces/NotificationHandler/PNHandlerInterface";

class PNHandler implements PNHandlerInterface{
    handlePushNotification(message: string): boolean {
        console.log(`implementing Push notification handler ${message}`)
        return true;
    }
}

export default PNHandler