import {Snowflake} from "discord.js";
import Mongo from "./mongo-database";

const defaultGuildConfig: Partial<GuildConfig> = {
    //
};

export enum GuildConfigChannelType {
    "mod-log" = "modLogChannel",
    welcome = "welcomeChannel"
}

export type GuildConfig = {
    readonly id: Snowflake;
    readonly modLogChannel?: Snowflake;
    readonly welcomeChannel?: Snowflake;
}

export class DatabaseGuildConfig {
    public static async getOrDefault(guildId: Snowflake): Promise<GuildConfig> {
        return await DatabaseGuildConfig.get(guildId) || defaultGuildConfig as GuildConfig;
    }

    public static async get(guildId: Snowflake): Promise<GuildConfig | null> {
        return await Mongo.collections.guildConfig.findOne({
            id: guildId
        }) || null;
    }

    public static async exists(guildId: Snowflake): Promise<boolean> {
        return await DatabaseGuildConfig.get(guildId) !== null;
    }

    public static create(guildId: Snowflake, overwrites: Partial<GuildConfig>): GuildConfig {
        return {
            ...(defaultGuildConfig as GuildConfig),
            ...overwrites,
            id: guildId
        };
    }

    public static async update(guildId: Snowflake, guildConfig: Partial<GuildConfig>): Promise<void> {
        if (await DatabaseGuildConfig.exists(guildId)) {
            await Mongo.collections.guildConfig.updateOne({
                id: guildId
            }, {
                $set: guildConfig
            });
        }
        else {
            await Mongo.collections.guildConfig.insertOne(DatabaseGuildConfig.create(guildId, guildConfig));
        }
    }

    public static async setChannel(type: GuildConfigChannelType, channelId: Snowflake, guildId: Snowflake): Promise<void> {
        if (!Object.keys(GuildConfigChannelType).includes(type)) {
            throw new Error(`[DatabaseGuildConfig.setChannel] Invalid channel type: ${type}`);
        }

        await DatabaseGuildConfig.update(guildId, {
            [GuildConfigChannelType[type]]: channelId
        });
    }
}