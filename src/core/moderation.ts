import {IDatabaseModerationAction} from "../database/mongo-database";

export default abstract class Moderation {
    public static getExpiredActions(): Promise<IDatabaseModerationAction> {

    }
}