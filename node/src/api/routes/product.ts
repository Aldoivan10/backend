import { Router } from "express"

const router = Router()

// Obtener por ID
router.get("/:id(\\d+)", (req, res) => {
    const params = req.params
    res.json({ message: "ID" })
})

// Obtener por filtro like con *
router.get("/:filter(.*\\*.*)", (req, res) => {
    const { limit = 10, offset = 0 } = req.query
    const params = req.params
    console.log(params)
    res.json({
        message: "filter like",
    })
})

// Obtener por filtro
router.get("/:filter?", (req, res) => {
    const { limit = 10, offset = 0 } = req.query
    const params = req.params
    req.app.locals.db
    console.log(params, limit, offset)
    res.json({ message: "filter" })
})

// Insertar un producto
router.post("/", (req, res) => {
    console.log(req.app.locals.db)
})

router.put("/:id", (req, res) => {})

router.patch("/:id", (req, res) => {})

router.delete("/:ids", (req, res) => {})

export default router
