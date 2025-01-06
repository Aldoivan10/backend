import { Container } from "inversify"
import { APIDataBase } from "../models/db"
import { AuthContainer } from "./auth.cnt"
import { BudgetContainer } from "./budget.cnt"
import { CatalogContainer } from "./catalog.cnt"
import { EntityContainer } from "./entity.cnt"
import { KitContainer } from "./kit.cnt"
import { ParserContainer } from "./parser.cnt"
import { ProductContainer } from "./product.cnt"
import { SaleContainer } from "./sale.cnt"
import { Types } from "./types"
import { UserContainer } from "./user.cnt"

export const container = new Container()

//Registrar base de datos
container.bind<APIDataBase>(Types.DataBase).to(APIDataBase).inSingletonScope()

AuthContainer(container)
BudgetContainer(container)
CatalogContainer(container)
EntityContainer(container)
KitContainer(container)
ProductContainer(container)
UserContainer(container)
ParserContainer(container)
SaleContainer(container)
