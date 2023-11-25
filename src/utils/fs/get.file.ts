import { readFile } from "node:fs/promises"


export const getFile = async (path: string): Promise<Buffer> => {
    // const file = new Promise((resolve, reject) => {
    //     readFile(path, { encoding: 'utf-8' }, (error, content) => {
    //         if (error) {
    //             console.error(error)
    //             reject(error)
    //         }
    //         // console.log(content)
    //         resolve(content)
    //     })
    // })
    try {
        const content = await readFile(path)
        return content
    } catch (err) {
        console.log(err)
        throw err
    }

}