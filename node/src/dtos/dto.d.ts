declare namespace DTO {
    type TransformFilters = {
        value: Record<string, string | number | boolean>
    }

    type TransformOrders = { value: string[] }

    type Shortcut = { accion: string; atajo: string; vista: number }
}
