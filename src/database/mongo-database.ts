import {Collection, Db, MongoClient} from "mongodb";
import Log from "discord-anvil/dist/core/log";
import {GuildMember, Snowflake} from "discord.js";

const url: string = "mongodb://mongoadm:mongopass@mongo:27017/admin";
const dbName: string = "warden";

export type MongoCollections = {
    readonly messages: Collection;
    readonly moderationActions: Collection;
};

export enum ModerationActionType {
    Warn,
    Mute,
    Unmute,
    Kick,
    Ban,
    Unban
}

export type ModerationAction = {
    readonly type: ModerationActionType;
    readonly member: GuildMember;
    readonly reason: string;
    readonly moderator: GuildMember;
    readonly evidence?: string;
    readonly end?: number;
};

export type DatabaseWarning = {
    readonly reason: string;
    readonly memberId: Snowflake;
    readonly moderatorId: Snowflake;
    readonly type: ModerationActionType;
    readonly time: number;
    readonly evidence?: string;
    readonly end?: number;
};

export type DatabaseMessage = {
    readonly author: string;
    readonly authorId: Snowflake;
    readonly messageId: Snowflake;
    readonly message: string;
    readonly time: number;
    readonly guildId: Snowflake;
    readonly channelId: Snowflake;
};

export default abstract class Mongo {
    public static db: Db;

    public static collections: MongoCollections;

    public static connect(): Promise<boolean> {
        return new Promise((resolve) => {
            MongoClient.connect(url, {
                useNewUrlParser: true
            }, async (error: Error, client: MongoClient) => {
                if (error) {
                    Log.debug("There was an error establishing connection to the MongoDB database.");
                    console.log(error.message);

                    resolve(false);

                    return;
                }

                Log.debug("Successfully connected to the MongoDB database.");

                // Store Database
                Mongo.db = client.db(dbName);

                // Setup Collections
                Mongo.collections = {
                    messages: Mongo.db.collection("messages"),
                    moderationActions: Mongo.db.collection("moderation-actions")
                };

                resolve(true);

                return;
            });
        });
    }
}
