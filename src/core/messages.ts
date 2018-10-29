import {Snowflake} from "discord.js";
import Mongo, {IDbMessage} from "../database/mongo-database";

export default abstract class Messages {
    public static async getById(messageId: Snowflake): Promise<IDbMessage | null> {
        return await Mongo.collections.messages.findOne({
            messageId: messageId
        }) || null;
    }

    public static async add(message: IDbMessage): Promise<void> {
        await Mongo.collections.messages.insertOne(message);
    }
}
