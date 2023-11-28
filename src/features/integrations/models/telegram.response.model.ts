export class TelegramResponseModel {
    message: {
        from: {
            id: number,
            username: string,
        }
        text: string
        entities: any
    }

}