import { FilterDto } from "../dtos/filter.dto"

export class FilterDomain {
    private operatorMap: Record<string, string> = {
        gt: ">",
        gte: ">=",
        lt: "<",
        lte: "<=",
        eq: "=",
        like: "LIKE",
    }
    private orders = ["ASC", "DESC"]
    private data: FilterData = {}
    private filter = ""

    private where?: string
    private offset?: string
    private limit?: string
    private order?: string

    constructor(
        private readonly allowedColumns: string[],
        filters?: FilterDto
    ) {
        this.setFilters(filters?.filters)
        this.setOffset(filters?.offset)
        this.setOrder(filters?.orders)
        this.setLimit(filters?.limit)
    }

    public setFilters(filters?: FilterData) {
        if (filters) {
            const data = Object.keys(filters)
                .map(this.getClause.bind(this))
                .filter(Boolean)
                .join(" AND ")
            if (data) this.where = `WHERE ${data}`
            this.data = filters
        }
    }

    public setOffset(offset?: number) {
        if (offset) this.offset = `OFFSET ${offset}`
        else this.offset = undefined
        return this
    }

    public setLimit(limit?: number) {
        if (limit) this.limit = `LIMIT ${limit}`
        else this.limit = undefined
        return this
    }

    public setOrder(orders?: string[]) {
        if (orders && orders.length)
            this.order =
                "ORDER BY " +
                orders.map(this.getOrder.bind(this)).filter(Boolean).join()
    }

    public build() {
        const arr = [this.where, this.order, this.limit, this.offset]
        this.filter = arr.filter(Boolean).join(" ")
        return this
    }

    public getFilter() {
        return this.filter
    }

    public getData() {
        return this.data
    }

    private getClause(key: string) {
        const parts = key.split("_")
        const column = parts.slice(0, -1).join("_")
        const operatorKey = parts[parts.length - 1]
        if (!this.allowedColumns.includes(column)) return ""
        return `${column} ${this.getOperator(operatorKey)} @${key}`
    }

    private getOrder(item: string) {
        const [column, order = "ASC"] = item.split("_")
        if (
            !this.allowedColumns.includes(column) ||
            !this.orders.includes(order.toUpperCase())
        )
            return ""
        return `${column} ${order}`.trim()
    }

    private getOperator(operator: string) {
        return this.operatorMap[operator] || "="
    }
}
