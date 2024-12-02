import Repository from "./repository"

export default class EntityRepository extends Repository<Entity> {
    private columns = [
        "id_tipo_entidad AS id_entity_type",
        "rfc AS rfc",
        "nombre AS name",
        "direccion AS address",
        "domicilio AS domicile",
        "codigo_postal AS postal_code",
        "telefono AS phone",
        "correo AS email",
    ]

    constructor() {
        super("Entidad")
        this.init({ columns: this.columns })
    }

    insert(item: Entity): Entity {
        throw new Error("Method not implemented.")
    }

    update(id: number, item: Entity): Entity {
        throw new Error("Method not implemented.")
    }

    delete(ids: number[]): Entity {
        throw new Error("Method not implemented.")
    }
}
