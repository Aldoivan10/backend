import { Router } from "express"
import { container } from "../containers"
import { Types } from "../containers/types"
import { AuthController } from "../controllers/auth.ctrl"
import { tokenMW } from "../middlewares/token.mw"
import { validationMW } from "../middlewares/validation.mw"
import { AdminSchema, LoginSchema } from "../validations/login.val"

const router = Router()
const controller = container.get<AuthController>(Types.AuthController)

router.get("/users", controller.users.bind(controller))

router.post(
    "/login",
    validationMW(LoginSchema),
    controller.login.bind(controller)
)

router.post(
    "/login/admin",
    validationMW(AdminSchema),
    tokenMW,
    controller.auth.bind(controller)
)

router.post(
    "/logout",
    validationMW(LoginSchema),
    controller.logout.bind(controller)
)

router.post(
    "/clear",
    validationMW(LoginSchema),
    controller.clear.bind(controller)
)

export default router
