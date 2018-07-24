import knex, { QueryBuilder } from "knex";
import { Log } from "discord-anvil";
import { Snowflake } from "discord.js";

export default class Database {
    readonly path: string;

    private x?: any;

    constructor(path: string) {
        this.path = path;
    }

    public connect(): this {
        if (this.x) {
            Log.warn("[Database.connect] Attempting to connect over already existing connection");
        }

        this.x = knex({
            client: "sqlite3",

            connection: {
                filename: this.path
            }
        });

        return this;
    }

    public getMessage(id: Snowflake): 

    private async getSingle<Type>(query: QueryBuilder): Type | null {
        return await query.then()[0];
    }
}