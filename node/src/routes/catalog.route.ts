import { Request, Router } from "express"
import { container } from "../containers"
import { Types } from "../containers/types"
import { CatalogController } from "../controllers/catalog.ctrl"
import { requireAdminMW, tokenMW } from "../middlewares/token.mw"
import { validationMW } from "../middlewares/validation.mw"
import { CatalogSchemas } from "../validations/catalog.val"
import { IdsSchema } from "../validations/general.val"

const controller = container.get<CatalogController>(Types.CatalogController)
const root = controller.getRoute()
const router = Router()

function getSchema(req: Request) {
    const { table } = req.params
    return CatalogSchemas[table]
}

router.get(root, controller.findAll.bind(controller))
router.get(`${root}/single`, controller.find.bind(controller))
router.get(`${root}/:id(\\d+)`, controller.findByID.bind(controller))
router.post(
    root,
    tokenMW,
    requireAdminMW,
    validationMW(getSchema),
    controller.create.bind(controller)
)
router.patch(
    `${root}/:id(\\d+)`,
    tokenMW,
    requireAdminMW,
    validationMW(getSchema),
    controller.update.bind(controller)
)
router.delete(
    root,
    tokenMW,
    requireAdminMW,
    validationMW(IdsSchema),
    controller.delete.bind(controller)
)

export default router
