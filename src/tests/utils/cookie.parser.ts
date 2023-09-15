export const cookieParser = (cookie: string[]) => {
    const cookies = cookie.map(elem => {
        const [name, value] = elem.split(';')[0].split('=')

        return {
            [name]: value
        }
    })

    return cookies
}