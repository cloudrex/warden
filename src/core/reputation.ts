import {Snowflake} from "discord.js";
import Mongo, {DatabaseReputation} from "../database/mongo-database";

export default abstract class Reputation {
    public static async getReputation(userId: Snowflake): Promise<number> {
        const result: DatabaseReputation | null = await Mongo.collections.reputation.findOne({
            userId: userId
        });

        return result !== null ? result.amount : 0;
    }

    public static async setReputation(userId: Snowflake, amount: number): Promise<void> {
        await Mongo.collections.reputation.updateOne({
            userId: userId
        }, {
            $set: {
                amount: amount
            }
        }, {
            upsert: true
        });
    }

    public static async increaseReputation(userId: Snowflake, amount: number = 1): Promise<void> {
        await Reputation.setReputation(userId, await Reputation.getReputation(userId) + amount);
    }

    public static async decreaseReputation(userId: Snowflake, amount: number = -1): Promise<void> {
        await Reputation.increaseReputation(userId, amount);
    }
}
