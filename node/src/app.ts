import cookieParser from "cookie-parser"
import express, { json } from "express"
import "reflect-metadata"
import { HOST, PORT } from "./config"
import { errorMW } from "./middlewares/error.mw"
import { logMW } from "./middlewares/log.mw"
import auth from "./routes/auth.route"
import catalogRoute from "./routes/catalog.route"
import entityRoute from "./routes/entity.route"
import kitRoute from "./routes/kit.route"
import productRoute from "./routes/product.route"
import userRoute from "./routes/user.route"

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
app.use("/kit", kitRoute)
app.use("/product", productRoute)
app.use("/entity", entityRoute)
app.use("/user", userRoute)
app.use(catalogRoute)
// Manejador de errores
app.use(errorMW)

app.listen(PORT, HOST, () =>
    console.log(`Server running at http://${HOST}:${PORT}/`)
)
