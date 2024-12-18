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
    private data: Record<string, string> = {}
    private filter = ""

    private where?: string
    private offset?: string
    private limit?: string
    private order?: string

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

    public setOrder(orders?: string[]) {
        if (orders)
            this.order =
                "ORDER BY " +
                orders.map(this.getOrder.bind(this)).map(Boolean).join()
    }

    private setData(
        filters?: Record<string, string | number>,
        orders?: Record<string, Maybe<string>>
    ) {}

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

    private getOrder(item: string) {
        const [column, order = ""] = item.split("_")
        if (
            !this.allowedColumns.includes(column) ||
            !this.orders.includes(order)
        )
            return ""
        return `${column} ${order}`.trim()
    }

    private getOperator(operator: string) {
        return this.operatorMap[operator] || "="
    }
}
