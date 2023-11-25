import { GetObjectCommand, PutObjectCommand, PutObjectCommandOutput, S3Client } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";


@Injectable()
export class FileS3Adapter {
    s3client: S3Client
    bucketName = String(process.env.S3_BUCKET_NAME)

    constructor() {
        this.s3client = new S3Client({
            region: String(process.env.S3_REGION),
            endpoint: String(process.env.S3_ENDPOINT),
            credentials: {
                accessKeyId: String(process.env.S3_ID),
                secretAccessKey: String(process.env.S3_KEY)
            }
        })
    }

    async saveImage(blogId: string, originalName: string, buffer: Buffer): Promise<string> {
        const key = `content/blogs/${blogId}/wallpaper/${originalName}`
        const bucketParams = {
            Bucket: this.bucketName,
            Key: key,
            Body: buffer
        }

        const command = new PutObjectCommand(bucketParams)

        try {
            const result: PutObjectCommandOutput = await this.s3client.send(command)
            // return 'https://blog-platform1.storage.yandexcloud.net/content/blogs/10/wellpaper/10.jpg'
            // return key
            console.log(result)
        } catch (error) {
            console.error(error)
        }

        return key
    }

    // async getImage() {

    //     const key = `content/blogs/10/wellpaper/10.jpg`

    //     const { Body } = await this.s3client.send(
    //         new GetObjectCommand({
    //           Bucket: this.bucketName,
    //           Key: key,
    //         })
    //       );

    //       console.log(await Body.transformToString());
    // const getObjectParams = {
    //     Bucket: this.bucketName,
    //     Key: key, // например, 'images/example.jpg'
    // };

    // // Выполните запрос к S3 для получения данных картинки
    // const getObjectCommand = new GetObjectCommand(getObjectParams);
    // const objectData = await this.s3client.send(getObjectCommand);

    // console.log('object', objectData, 'object')
    // return objectData
    // }
}