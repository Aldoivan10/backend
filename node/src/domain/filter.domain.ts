import { FilterDto } from "../dtos/filter.dto"

export class FilterDomain {
    private where?: string
    private offset?: string
    private limit?: string
    private order?: string

    private filter = ""

    private operatorMap: Record<string, string> = {
        gt: ">",
        gte: ">=",
        lt: "<",
        lte: "<=",
        eq: "=",
        like: "LIKE",
    }
    private orders = ["ASC", "DESC"]

    constructor(
        private readonly allowedColumns: string[],
        private readonly filters?: FilterDto
    ) {
        this.setFilters(filters?.filters)
        this.setOffset(filters?.offset)
        this.setOrder(filters?.orders)
        this.setLimit(filters?.limit)
    }

    public setFilters(filters?: Record<string, string | number>) {
        if (filters)
            this.where =
                "WHERE " +
                Object.keys(filters)
                    .map(this.getClause.bind(this))
                    .map(Boolean)
                    .join(" AND ")
    }

    public setOffset(offset?: number) {
        if (offset) this.offset = `OFFSET ${offset}`
    }

    public setLimit(limit?: number) {
        if (limit) this.limit = `LIMIT ${limit}`
    }

    public setOrder(orders?: Record<string, Maybe<string>>) {
        if (orders)
            this.order =
                "ORDER BY " +
                Object.entries(orders)
                    .map(this.getOrder.bind(this))
                    .map(Boolean)
                    .join()
    }

    public build() {
        const arr = [this.where, this.order, this.offset, this.limit]
        this.filter = arr.filter(Boolean).join(" ")
        return this
    }

    public getFilter() {
        return this.filter
    }

    private getClause(key: string) {
        const [column, operatorKey] = key.split("_")
        if (!this.allowedColumns.includes(column)) return ""
        return `${column} ${this.getOperator(operatorKey)} @${key}`
    }

    private getOrder([key, val]: [string, Maybe<string>]) {
        const order = (val ?? "ASC").toUpperCase()
        if (!this.allowedColumns.includes(key) || !this.orders.includes(order))
            return ""
        return `${key} ${order}`
    }

    private getOperator(operator: string) {
        return this.operatorMap[operator] || "="
    }
}
