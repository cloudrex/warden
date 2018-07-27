import { Snowflake } from "discord.js";

export interface DatabaseMessage {
    readonly id: Snowflake;
    readonly author: Snowflake;
    readonly authorTag: string;
    readonly text: string;
    readonly time: number;
    readonly channel: Snowflake;
    readonly deleted: boolean;
}