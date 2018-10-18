import {Collection, Db, MongoClient} from "mongodb";
import {GuildMember, Snowflake} from "discord.js";
import {MemberConfigType} from "../core/warden-api";

const url: string = process.env.DB_URL || `mongodb://${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 27017}/${process.env.DB_NAME || ""}`;
const dbName: string = "warden";

export type MongoCollections = {
    readonly messages: Collection;
    readonly moderationActions: Collection;
    readonly backups: Collection;
    readonly memberConfig: Collection;
    readonly guildConfig: Collection;
    readonly reputation: Collection;
    readonly storedMessages: Collection;
};

export enum ModerationActionType {
    Warn,
    Mute,
    Unmute,
    Kick,
    Ban,
    Unban,
    Softban
}

export enum ChannelType {
    Text,
    Voice
}

/**
 * await Mongo.collections.moderationActions.insertOne({
            type: action.type,
            reason: action.reason,
            memberId: action.member.id,
            guildId: action.member.guild.id,
            moderatorId: action.moderator.id,
            end: action.end,
            time: Date.now(),
            evidence: action.evidence
        });
 */

export type ModerationAction = {
    readonly type: ModerationActionType;
    readonly member: GuildMember;
    readonly reason: string;
    readonly moderator: GuildMember;
    readonly evidence?: string;
    readonly end?: number;
};

export type DatabaseModerationAction = {
    readonly id: Snowflake;
    readonly type: ModerationActionType;
    readonly memberId: Snowflake;
    readonly reason: string;
    readonly moderatorId: Snowflake;
    readonly guildId: Snowflake;
    readonly evidence?: string;
    readonly time: number;
    readonly end?: number;
};

export type DatabaseMessage = {
    readonly authorTag: string;
    readonly authorId: Snowflake;
    readonly messageId: Snowflake;
    readonly message: string;
    readonly time: number;
    readonly guildId: Snowflake;
    readonly channelId: Snowflake;
};

export type DatabaseChannel = {
    readonly id: Snowflake;
    readonly name: string;
    readonly topic?: string;
    readonly type: ChannelType;
}

export type DatabaseBackup = {
    readonly time: number,
    readonly guildId: Snowflake;
    readonly channels: DatabaseChannel[];
};

export type DatabaseUserConfig = {
    readonly userId: Snowflake;
    readonly type: MemberConfigType;
    readonly value: string | boolean;
};

export type DatabaseStoredMessage = {
    readonly ownerId: Snowflake;
    readonly authorId: Snowflake;
    readonly authorTag: string;
    readonly message: string;
    readonly time: number;
    readonly name: string;
};

export type DatabaseWhitelist = {
    // TODO
};

export type DatabaseReputation = {
    readonly tag: string;
    readonly userId: Snowflake;
    readonly amount: number;
};

export default abstract class Mongo {
    public static db: Db;

    public static collections: MongoCollections;

    public static get available(): boolean {
        return Mongo.db !== undefined;
    }

    public static connect(): Promise<boolean> {
        return new Promise((resolve) => {
            MongoClient.connect(url, {
                useNewUrlParser: true
            }, async (error: Error, client: MongoClient) => {
                if (error) {
                    // Log.debug("There was an error establishing connection to the MongoDB database.");
                    console.log(error.message);

                    resolve(false);

                    return;
                }

                // Log.debug("Successfully connected to the MongoDB database.");

                // Store Database
                Mongo.db = client.db(dbName);

                // Setup Collections
                Mongo.collections = {
                    messages: Mongo.db.collection("messages"),
                    moderationActions: Mongo.db.collection("moderation-actions"),
                    backups: Mongo.db.collection("backups"),
                    memberConfig: Mongo.db.collection("member-config"),
                    guildConfig: Mongo.db.collection("guild-config"),
                    reputation: Mongo.db.collection("reputation"),
                    storedMessages: Mongo.db.collection("stored-messages")
                };

                resolve(true);

                return;
            });
        });
    }
}
