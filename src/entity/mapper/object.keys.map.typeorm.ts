export const objectKeysMapTypeorm = (arr: any[]) => {
    return arr.map((item) => {
        const comment: any = {}

        Object.keys(item).forEach(key => {
            const k = key.replace(/.*_/gi, '')
            comment[k] = item[key]
        })

        return comment
    })
}