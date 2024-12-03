import cookieParser from "cookie-parser"
import express, { json } from "express"
import { HOST, PORT } from "./config"
import { errorMW } from "./middleware/errorMW"
import { logMW } from "./middleware/logMW"
import DB from "./model/db"
import auth from "./routes/auth"
import catalogRoute from "./routes/catalog"
import entityRoute from "./routes/entity"
import productRoute from "./routes/product"
import userRoute from "./routes/user"

const app = express()

// Deshabilitar el header X-Powered-By
app.disable("x-powered-by")
// Middleware para logs de peticiones
app.use(logMW)
// Middleware para parsear el body de la petición
app.use(json())
// Middleware para las cookies
app.use(cookieParser())
// Ignorar peticiones a favicon
app.get("/favicon.ico", (_, res) => {
    res.status(204)
})
// Pagina de bienvenida
app.get("/", (_, res) => {
    res.status(200).json({ message: "API con express", dev: "Aldoivan" })
})
// Ruta para la autenticación de usuarios
app.use(auth)
// Rutas
app.use("/product", productRoute)
app.use("/entity", entityRoute)
app.use("/user", userRoute)
app.use(catalogRoute)
// Manejador de errores
app.use(errorMW)

async function init() {
    try {
        app.locals.db = await new DB().open("../database.db")
        app.listen(PORT, HOST, async () => {
            console.log(`Server running at http://${HOST}:${PORT}/`)
        })
    } catch (error) {
        console.log(error)
    }
}

init()