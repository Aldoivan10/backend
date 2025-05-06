import { Router } from "express"
import { container } from "../containers"
import { Types } from "../containers/types"
import { ProductController } from "../controllers/product.ctrl"
import { requireAdminMW, tokenMW } from "../middlewares/token.mw"
import { validationMW } from "../middlewares/validation.mw"
import { IdsSchema } from "../validations/general.val"
import { ProductSchema } from "../validations/product.val"

const controller = container.get<ProductController>(Types.ProductController)
const router = Router()

router.get("/", controller.findAll.bind(controller))
router.get("/single", controller.find.bind(controller))
router.get("/total", controller.total.bind(controller))
router.get("/:id(\\d+)", controller.findByID.bind(controller))
router.get("/code/:code", controller.findByCode.bind(controller))
router.post(
    "/",
    tokenMW,
    requireAdminMW,
    validationMW(ProductSchema),
    controller.create.bind(controller)
)
router.patch(
    "/:id(\\d+)",
    tokenMW,
    requireAdminMW,
    validationMW(ProductSchema),
    controller.update.bind(controller)
)
router.delete(
    "/",
    tokenMW,
    requireAdminMW,
    validationMW(IdsSchema),
    controller.delete.bind(controller)
)

export default router
