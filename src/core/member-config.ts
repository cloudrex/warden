import {Snowflake} from "discord.js";
import Mongo, {DatabaseUserConfig} from "../database/mongo-database";
import {MemberConfigType} from "./warden-api";
import {Log} from "forge";

export class MemberConfigIterator {
    private resource: Array<DatabaseUserConfig>;

    constructor(resource: Array<DatabaseUserConfig>) {
        this.resource = resource;
    }

    public find(property: MemberConfigType): DatabaseUserConfig | null {
        const result: Array<DatabaseUserConfig> = this.resource.filter((config: DatabaseUserConfig) => config.type === property);

        if (result.length === 0) {
            return null;
        }
        else if (result.length > 1) {
            Log.warn(`[MemberConfig.find] Expecting one item, got ${result.length}`);

            return null;
        }

        return result[0];
    }

    public findValue(property: MemberConfigType, defaultValue: string = "Undefined"): string {
        const result: DatabaseUserConfig | null = this.find(property);

        if (result !== null) {
            return result.value.toString();
        }

        return defaultValue;
    }
}

export default abstract class MemberConfig {
    public static getAll(userId: Snowflake): Promise<Array<DatabaseUserConfig>> {
        return Mongo.collections.memberConfig.find({
            userId: userId
        }).toArray();
    }

    public static async set(config: DatabaseUserConfig): Promise<void> {
        await Mongo.collections.memberConfig.updateOne({
            userId: config.userId,
            type: config.type
        }, {
            $set: config
        }, {
            upsert: true
        });
    }

    public static async get(userId: Snowflake, type: MemberConfigType): Promise<string | boolean | null> {
        const result: DatabaseUserConfig | null = await Mongo.collections.memberConfig.findOne({
            userId: userId,
            type: type
        });

        return result !== null ? result.value : null;
    }
}