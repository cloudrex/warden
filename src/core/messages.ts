import {Snowflake} from "discord.js";
import Mongo, {IDatabaseMessage} from "../database/mongo-database";

export default abstract class Messages {
    public static async getById(messageId: Snowflake): Promise<IDatabaseMessage | null> {
        return await Mongo.collections.messages.findOne({
            messageId: messageId
        }) || null;
    }

    public static async add(message: IDatabaseMessage): Promise<void> {
        await Mongo.collections.messages.insertOne(message);
    }
}
