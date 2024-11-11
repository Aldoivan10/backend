export const plural = (word: string) => {
    if (word.endsWith("d")) return word + "es"
    return word + "s"
}
