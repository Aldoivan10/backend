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

    type code = { id: number; name: string; code: string }

    type unit = { id: number; name: string; profit: number; sale: number }
}
