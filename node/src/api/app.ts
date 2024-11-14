import express, { json } from "express"
import DB from "../model/db"
import { errorMW } from "./middleware/errorMW"
import { logMW } from "./middleware/logMW"
import catalogRoute from "./routes/catalog"
import entityRoute from "./routes/entity"
import productRoute from "./routes/product"
import * as Logger from "./util/logger"

const app = express()
const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || "localhost"

app.disable("x-powered-by")
app.use(json()) // Middleware para parsear el body de la petición

app.use(logMW) // Middleware para logs de peticiones
app.get("/", (_, res) => {
    res.json({ message: "API con express", dev: "Aldoivan" })
})

app.use("/product", productRoute)
app.use("/entity", entityRoute)
app.use(catalogRoute)

app.use(errorMW) // Manejador de errores

async function init() {
    try {
        app.locals.db = await new DB().open("../database.db")
        app.listen(+PORT, HOST, async () => {
            console.log(`Server running at http://${HOST}:${PORT}/`)
        })
    } catch (error) {
        Logger.error(error as Error)
    }
}

init()
