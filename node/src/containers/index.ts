import { Container } from "inversify"
import { APIDataBase } from "../models/db"
import { Types } from "./types"

export const container = new Container()

//Registrar base de datos
container.bind<APIDataBase>(Types.DataBase).to(APIDataBase).inSingletonScope()
