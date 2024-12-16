export abstract class BaseDTO<DB, DTO> {
    protected mapper?: Record<string, string>

    public abstract toBD: (obj: Record<string, any>) => DB

    public abstract toObj: (obj: Record<string, any>) => DTO

    protected hasAttrs(obj: Record<string, any>, attrs: string[]) {
        return attrs.every((attr) => attr in obj)
    }
}
