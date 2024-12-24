import bcrypt from "bcrypt"
import { ClassTransformOptions, plainToClass } from "class-transformer"
import { InitUser, UserDTO } from "../dtos/user.dto"
import { AuthRepo } from "../repositories/auth.repo"

export class AuthService {
    private repo = new AuthRepo()
    private classOptions: ClassTransformOptions = {
        groups: ["admin"],
        excludeExtraneousValues: true,
    }

    public availableUsers() {
        const users = this.repo
            .users()
            .map((user) => plainToClass(InitUser, user))
        return users
    }

    public authenticate(username: string) {
        const user = plainToClass(
            UserDTO,
            this.repo.auth(username),
            this.classOptions
        )
        return user.payload
    }

    public login(payload: TokenPayload, password?: Maybe<string>) {
        const user = plainToClass(
            UserDTO,
            this.repo.auth(payload.name),
            this.classOptions
        )
        if (!this.isPassword(password, user.password)) return false
        payload.logged = true
        return true
    }

    private isPassword(password?: Maybe<string>, hashed?: Maybe<string>) {
        return password && hashed && bcrypt.compareSync(password, hashed)
    }
}
