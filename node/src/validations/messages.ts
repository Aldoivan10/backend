export const MESSAGES = {
    REQUIRED: "Campo requerido",
    INVALID: "ID no válido",
    MIN_ZERO: "El valor mínimo es 0",
    MIN_ONE: "El valor mínimo es 1",
    UNKNOWN_FIELD: (field: string) => `${field} desconocido`,
    AT_LEAST_FIELD: (field: string) => `Al menos ${field} es requerido`,
    REQUIRED_FIELD: (field: string) => `${field} es obligatorio`,
    MIN_AMOUNT: (field: string) => `La cantidad mínima de ${field} es 0`,
    PRICE: (type: string) => `El precio de ${type} no es válido`
} as const