declare namespace Ctrl {
    type Messages =
        | {
              create: string
              update: string
              delete: string
          }
        | Record<string, any>
}
