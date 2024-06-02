interface SMSHandlerInterface {
    handleSMS(message: string): boolean
}

export default SMSHandlerInterface