// Creamos un placeholder de ? para un arreglo
export const getPlaceholders = (arr: any[]) => {
    return arr.map((_) => "?").join()
}

export const arrConj = (arr: string[], lang = "es") => {
    const formatter = new Intl.ListFormat(lang, {
        style: "long",
        type: "conjunction",
    })
    return formatter.format(arr)
}
