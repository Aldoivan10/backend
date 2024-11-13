export const nameAttr: any = (max: number) => {
    return {
        isString: {
            errorMessage: "El nombre deben ser carácteres",
        },
        trim: true,
        notEmpty: {
            errorMessage: "El nombre es obligatorio",
        },
        escape: true,
        isLength: {
            options: { max },
            errorMessage: `El nombre no debe exceder de ${max} carácteres`,
        },
    }
}
