import knex, { QueryBuilder } from "knex";
import { KnexTable, Log } from "discord-anvil";
import { DatabaseMessage } from "./database-entities";

export default class Database {
    public readonly path: string;
    public readonly messages: KnexTable<DatabaseMessage>;

    private x: knex;

    constructor(path: string) {
        this.path = path;

        // Setup the database
        this.x = knex({
            client: "sqlite3",

            connection: {
                filename: this.path
            },

            useNullAsDefault: true
        });

        // Setup tables
        this.messages = new KnexTable(this.x, "messages");

        Log.success("[:Database] Database setup completed");
    }

    public getConnection(): knex {
        return this.x;
    }

    public async getSingle<Type>(query: QueryBuilder): Promise<Type | null> {
        return (await this.getMultiple<Type>(query))[0];
    }

    public async getMultiple<Type>(query: QueryBuilder): Promise<Array<Type>> {
        return (await query.then()) as Array<Type>;
    }
}