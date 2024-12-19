import bcrypt from "bcrypt"
import { plainToClass } from "class-transformer"
import { InitUser, User } from "../dtos/user.dto"
import { AuthRepo } from "../repositories/auth.repo"

export class AuthService {
    private repo = new AuthRepo()

    public availableUsers() {
        const users = this.repo
            .users()
            .map((user) => plainToClass(InitUser, user))
        return users
    }

    public authenticate(username: string) {
        const user = plainToClass(User, this.repo.auth(username))
        return user.payload
    }

    public login(username: string, password?: Maybe<string>) {
        const user = plainToClass(User, this.repo.auth(username))
        return (
            password &&
            user.password &&
            bcrypt.compareSync(password, user.password)
        )
    }
}
