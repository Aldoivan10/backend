import express, { json } from "express"
import DB from "../model/db"
import productRoute from "./routes/product"

const app = express()
const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || "localhost"

app.use(json()) // Middleware para parsear el body de la petición

app.get("/", (_, res) => {
    res.json({ message: "API con express", dev: "Aldoivan" })
})

app.use("/product", productRoute)

app.on("error", (err) => {
    console.error(err)
})

async function init() {
    try {
        app.locals.db = await new DB().open("../database.db")
        app.listen(+PORT, HOST, async () => {
            console.log(`Server running at http://${HOST}:${PORT}/`)
        })
    } catch (error) {
        console.error(error)
    }
}

init()
