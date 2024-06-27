import { reloadable } from "./lib/tstl-utils";
/*Types of construct signatures are incompatible.
      Type 'new <TName extends never>(tableName: TName) => LocalNetTables<TName>' is not assignable to type 'new (...args: any[]) => {}'.
      */
@reloadable
export default class LocalNetTables<
    TName extends keyof CustomNetTableDeclarations
    //K extends keyof CustomNetTableDeclarations[TName],
    //T extends CustomNetTableDeclarations[TName]
> {
    private tableName: TName;
    private localCache: CustomNetTableDeclarations[TName];
    constructor(...args: any[]) {
        this.tableName = args[0] as TName;
        this.localCache = {} as unknown as CustomNetTableDeclarations[TName];
    }
    public GetValue = <T extends keyof CustomNetTableDeclarations[TName]>(
        key: T
    ): CustomNetTableDeclarations[TName][T] => {
        return this.localCache[key];
    };
    public GetAllValues = () => {
        return this.localCache;
    };
    public SetValue = <K extends keyof CustomNetTableDeclarations[TName]>(
        key: K,
        value: CustomNetTableDeclarations[TName][K]
    ) => {
        this.localCache[key] = value;
        return CustomNetTables.SetTableValue(this.tableName, key, value);
    };
}
