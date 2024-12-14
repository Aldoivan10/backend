import bcrypt from "bcrypt"

// Validamos que la contraseña sea correcta
export const samePass = (pass: Maybe<string>, hashed: Maybe<string>) => {
    return !!pass && !!hashed && bcrypt.compareSync(pass, hashed)
}
