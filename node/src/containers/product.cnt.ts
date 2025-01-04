import { container } from "."
import { Controller } from "../controllers/controller"
import { ProductController } from "../controllers/product.ctrl"
import { ProductDTO } from "../dtos/product.dto"
import ProductRepository from "../repositories/product.repo"
import { IRepo } from "../repositories/repository"
import { ProductService } from "../services/product.svc"
import { IService } from "../services/service"
import { ProductSchema } from "../validations/product.val"
import { Types } from "./types"

container
    .bind<IRepo<Body.Product>>(Types.ProductRepository)
    .to(ProductRepository)
container
    .bind<IService<Body.Product, ProductDTO>>(Types.ProductService)
    .to(ProductService)
container
    .bind<Controller<typeof ProductSchema, Body.Product, ProductDTO>>(
        Types.ProductController
    )
    .to(ProductController)
