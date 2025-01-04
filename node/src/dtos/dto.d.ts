declare namespace DTO {
    type Transform = { value?: string }

    type TransformProduct = { value: string }

    type KitProducts = Array<{
        id: number
        nombre: string
        departamento: { id: number; nombre: string }
        proveedor: { id: number; nombre: string }
        cantidad: number
        min: number
        reembolsable: boolean
        codigos: Array<{ id: number; nombre: string; codigo: string }>
        unidades: Array<{
            id: number
            nombre: string
            ganancia: number
            venta: number
            cantidad: number
        }>
    }>

    type Shortcut = { accion: string; atajo: string; vista: number }

    type Item = { id: number; name: string }

    type Code = Item & { code: string }

    type Unit = Item & { profit: number; sale: number }

    type ProductBudget = {
        id_producto: number
        producto: string
        id_unidad: number
        unidad: string
        cantidad: number
    }
}
