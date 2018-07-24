import { Snowflake } from "discord.js";

export interface DatabaseMessage {
    readonly id: Snowflake;
    readonly author: Snowflake;
    readonly text: string;
    readonly time: number;
    readonly channel: Snowflake;
}