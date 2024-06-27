function SubscribeNetTableKey<
    TName extends keyof CustomNetTableDeclarations,
    K extends keyof CustomNetTableDeclarations[TName]
>(
    table: TName,
    key: K,
    callback: (
        data: NetworkedData<CustomNetTableDeclarations[TName][K]>
    ) => void
) {
    const listener = CustomNetTables.SubscribeNetTableListener(
        table,
        function (table, table_key, data) {
            if (key == table_key) {
                if (!data) {
                    return;
                }

                callback(
                    data as NetworkedData<CustomNetTableDeclarations[TName][K]>
                );
            }
        }
    );

    $.Schedule(0, () => {
        const data = CustomNetTables.GetTableValue(table, key);

        if (data) {
            callback(data);
        }
    });

    return listener;
}
function SubscribeNetTableAll<
    TName extends keyof CustomNetTableDeclarations,
    T extends CustomNetTableDeclarations[TName]
>(
    table: TName,
    callback: (
        tableName: TName,
        key: keyof T,
        value: NetworkedData<T[keyof T]>
    ) => void
) {
    const listener = CustomNetTables.SubscribeNetTableListener(
        table,
        function (table, table_key, data) {
            if (!data) {
                return;
            }

            callback(
                table,
                table_key,
                data as unknown as NetworkedData<T[keyof T]>
            );
        }
    );

    $.Schedule(0, () => {
        const data = CustomNetTables.GetAllTableValues(table);

        for (let { key, value } of data) {
            callback(table, key, value as unknown as NetworkedData<T[keyof T]>);
        }
    });

    return listener;
}
