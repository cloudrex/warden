import {Collection, Db, MongoClient} from "mongodb";
import {GuildMember, Snowflake, Collection} from "discord.js";
import {MemberConfigType} from "../core/warden-api";

const url: string = process.env.DB_URL || `mongodb://${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 27017}/${process.env.DB_NAME || ""}`;
const dbName: string = "warden";

export type MongoCollections = {
    readonly messages: Collection;
    readonly moderationActions: Collection;
    readonly backups: Collection;
    readonly memberConfig: Collection;
    readonly guildConfig: Collection;
    readonly storedMessages: Collection;
    readonly reports: Collection;
};

export enum ModerationActionType {
    Warn,
    Mute,
    Unmute,
    Kick,
    Ban,
    Unban,
    Softban,
    Test,
    BanId
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
    readonly memberTag: string;
    readonly reason: string;
    readonly moderatorId: Snowflake;
    readonly moderatorTag: string;
    readonly moderatorUsername: string;
    readonly moderatorAvatarUrl: string;
    readonly guildId: Snowflake;
    readonly evidence?: string;
    readonly time: number;
    readonly end?: number;
    readonly automatic: boolean;
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

export enum CollectionType {
    Messages = "messages",
    ModerationActions = "moderation-actions",
    Backups = "backups",
    MemberConfig = "member-config",
    GuildConfig = "guild-config",
    StoredMessages = "stored-messages",
    Reports = "reports"
}

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
                    messages: Mongo.db.collection(CollectionType.Messages),
                    moderationActions: Mongo.db.collection(CollectionType.ModerationActions),
                    backups: Mongo.db.collection(CollectionType.Backups),
                    memberConfig: Mongo.db.collection(CollectionType.MemberConfig),
                    guildConfig: Mongo.db.collection(CollectionType.GuildConfig),
                    storedMessages: Mongo.db.collection(CollectionType.StoredMessages),
                    reports: Mongo.db.collection(CollectionType.Reports)
                };

                resolve(true);

                return;
            });
        });
    }

    public static async insertRow(collection: CollectionType, row: any): Promise<void> {
        await Mongo.collections[collection].insertOne(row);
    }
}
