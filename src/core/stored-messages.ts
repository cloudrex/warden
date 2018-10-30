import Mongo, {IDbMessage, IDbStoredMessage} from "../database/mongo-database";
import {Snowflake, User} from "discord.js";
import Messages from "./messages";

export default abstract class StoredMessages {
    public static async add(message: IDbStoredMessage): Promise<void> {
        await Mongo.collections.storedMessages.insertOne(message);
    }

    public static async addByMessageId(user: User, name: string, messageId: Snowflake): Promise<boolean> {
        const message: IDbMessage | null = await Messages.getById(messageId);

        if (message !== null) {
            await StoredMessages.add({
                message: message.message,
                name: name,
                authorId: message.authorId,
                authorTag: message.authorTag,
                ownerId: user.id,
                time: message.time
            });

            return true;
        }

        return false;
    }

    public static async getAllByUser(userId: Snowflake): Promise<IDbStoredMessage[] | null> {
        const result: IDbStoredMessage[] = await Mongo.collections.storedMessages.find({
            ownerId: userId
        }).toArray();

        if (result === undefined || result === null || result.length === 0) {
            return null;
        }

        return result;
    }

    public static async getByName(userId: Snowflake, name: string): Promise<IDbStoredMessage | null> {
        return await Mongo.collections.storedMessages.findOne({
            ownerId: userId,
            name: name
        }) || null;
    }

    public static async existsByUserId(userId: Snowflake, name: string): Promise<boolean> {
        const storedMessages: IDbStoredMessage[] | null = await StoredMessages.getAllByUser(userId);

        if (storedMessages === null) {
            return false;
        }

        return storedMessages.filter((storedMessage: IDbStoredMessage) => storedMessage.name === name).length > 0;
    }
}
