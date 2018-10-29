import {Snowflake} from "discord.js";
import Mongo, {IDbUserConfig} from "../database/mongo-database";
import {MemberConfigType} from "./warden-api";
import {Log} from "@cloudrex/forge";

export class MemberConfigIterator {
    private resource: IDbUserConfig[];

    constructor(resource: IDbUserConfig[]) {
        this.resource = resource;
    }

    public find(property: MemberConfigType): IDbUserConfig | null {
        const result: IDbUserConfig[] = this.resource.filter((config: IDbUserConfig) => config.type === property);

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
        const result: IDbUserConfig | null = this.find(property);

        if (result !== null) {
            return result.value.toString();
        }

        return defaultValue;
    }
}

export default abstract class MemberConfig {
    public static getAll(userId: Snowflake): Promise<IDbUserConfig[]> {
        return Mongo.collections.memberConfig.find({
            userId: userId
        }).toArray();
    }

    public static async set(config: IDbUserConfig): Promise<void> {
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
        const result: IDbUserConfig | null = await Mongo.collections.memberConfig.findOne({
            userId: userId,
            type: type
        });

        return result !== null ? result.value : null;
    }
}