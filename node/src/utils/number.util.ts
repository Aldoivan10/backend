export const formatDecimals = (val: number, decimals = 2) => {
    const factor = 10 ** decimals
    return Math.round(val * factor) / factor
}
