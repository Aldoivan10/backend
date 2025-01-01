import { Container } from "inversify"
import { AuthController } from "../controllers/auth.ctrl"
import { CatalogController } from "../controllers/catalog.ctrl"
import { Controller } from "../controllers/controller"
import { EntityController } from "../controllers/entity.ctrl"
import { KitController } from "../controllers/kit.ctrl"
import { ProductController } from "../controllers/product.ctrl"
import { UserController } from "../controllers/user.ctrl"
import { CatalogDTO } from "../dtos/catalog.dto"
import { EntityDTO } from "../dtos/entity.dto"
import { KitDTO } from "../dtos/kit.dto"
import { ProductDTO } from "../dtos/product.dto"
import { UserDTO } from "../dtos/user.dto"
import { APIDataBase } from "../models/db"
import { AuthRepository } from "../repositories/auth.repo"
import { CatalogRepository } from "../repositories/catalog.repo"
import { EntityRepository } from "../repositories/entity.repo"
import { KitRepository } from "../repositories/kit.repo"
import ProductRepository from "../repositories/product.repo"
import { IRepo } from "../repositories/repository"
import UserRepository from "../repositories/user.repo"
import { AuthService } from "../services/auth.svc"
import { CatalogService } from "../services/catalog.svc"
import { EntityService } from "../services/entity.svc"
import { KitService } from "../services/kit.svc"
import { ProductService } from "../services/product.svc"
import { IService } from "../services/service"
import { UserService } from "../services/user.svc"
import { CatalogType } from "../validations/catalog.val"
import { EntitySchema } from "../validations/entity.val"
import { KitSchema } from "../validations/kit.val"
import { ProductSchema } from "../validations/product.val"
import { UserSchema } from "../validations/user.val"
import { Types } from "./types"

export const container = new Container()

//Registrar base de datos
container.bind<APIDataBase>(Types.DataBase).to(APIDataBase).inSingletonScope()

// Registrar repositorios
container
    .bind<IRepo<Body.Catalog>>(Types.CatalogRepository)
    .to(CatalogRepository)
container
    .bind<IRepo<Body.Product>>(Types.ProductRepository)
    .to(ProductRepository)
container.bind<IRepo<Body.Kit>>(Types.KitRepository).to(KitRepository)
container.bind<IRepo<Body.User>>(Types.UserRepository).to(UserRepository)
container.bind<IRepo<Body.Entity>>(Types.EntityRepository).to(EntityRepository)
container.bind<AuthRepository>(Types.AuthRepository).to(AuthRepository)

// Registrar servicios
container
    .bind<IService<Body.Catalog, CatalogDTO>>(Types.CatalogService)
    .to(CatalogService)
container
    .bind<IService<Body.Product, ProductDTO>>(Types.ProductService)
    .to(ProductService)
container.bind<IService<Body.User, UserDTO>>(Types.UserService).to(UserService)
container
    .bind<IService<Body.Entity, EntityDTO>>(Types.EntityService)
    .to(EntityService)
container.bind<AuthService>(Types.AuthService).to(AuthService)
container.bind<IService<Body.Kit, KitDTO>>(Types.KitService).to(KitService)

// Registrar controladores
container
    .bind<Controller<CatalogType, Body.Catalog, CatalogDTO>>(
        Types.CatalogController
    )
    .to(CatalogController)
container
    .bind<Controller<typeof ProductSchema, Body.Product, ProductDTO>>(
        Types.ProductController
    )
    .to(ProductController)
container
    .bind<Controller<typeof UserSchema, Body.User, UserDTO>>(
        Types.UserController
    )
    .to(UserController)
container
    .bind<Controller<typeof EntitySchema, Body.Entity, EntityDTO>>(
        Types.EntityController
    )
    .to(EntityController)
container
    .bind<Controller<typeof KitSchema, Body.Kit, KitDTO>>(Types.KitController)
    .to(KitController)
container.bind<AuthController>(Types.AuthController).to(AuthController)
