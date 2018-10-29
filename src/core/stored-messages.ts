import Mongo, {IDatabaseMessage, IDatabaseStoredMessage} from "../database/mongo-database";
import {Snowflake, User} from "discord.js";
import Messages from "./messages";

export default abstract class StoredMessages {
    public static async add(message: IDatabaseStoredMessage): Promise<void> {
        await Mongo.collections.storedMessages.insertOne(message);
    }

    public static async addByMessageId(user: User, name: string, messageId: Snowflake): Promise<boolean> {
        const message: IDatabaseMessage | null = await Messages.getById(messageId);

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

    public static async getAllByUser(userId: Snowflake): Promise<IDatabaseStoredMessage[] | null> {
        const result: IDatabaseStoredMessage[] = await Mongo.collections.storedMessages.find({
            ownerId: userId
        }).toArray();

        if (result === undefined || result === null || result.length === 0) {
            return null;
        }

        return result;
    }

    public static async getByName(userId: Snowflake, name: string): Promise<IDatabaseStoredMessage | null> {
        return await Mongo.collections.storedMessages.findOne({
            ownerId: userId,
            name: name
        }) || null;
    }

    public static async existsByUserId(userId: Snowflake, name: string): Promise<boolean> {
        const storedMessages: IDatabaseStoredMessage[] | null = await StoredMessages.getAllByUser(userId);

        if (storedMessages === null) {
            return false;
        }

        return storedMessages.filter((storedMessage: IDatabaseStoredMessage) => storedMessage.name === name).length > 0;
    }
}
