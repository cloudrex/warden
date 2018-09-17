import {Snowflake} from "discord.js";
import Mongo, {DatabaseMessage} from "../database/mongo-database";

export default abstract class Messages {
    public static async getById(messageId: Snowflake): Promise<DatabaseMessage | null> {
        return await Mongo.collections.messages.findOne({
            messageId: messageId
        }) || null;
    }

    public static async add(message: DatabaseMessage): Promise<void> {
        await Mongo.collections.messages.insertOne(message);
    }
}
