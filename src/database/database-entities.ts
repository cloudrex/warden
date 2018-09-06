import {Snowflake} from "discord.js";
import {CaseType} from "../warden-api";

export interface DatabaseMessage {
    readonly id: Snowflake;
    readonly author: Snowflake;
    readonly authorTag: string;
    readonly text: string;
    readonly time: number;
    readonly channel: Snowflake;
    readonly deleted: boolean;
}

export interface DatabaseCase {
    readonly id: number;
    readonly messageId: Snowflake;
    readonly channelId: Snowflake;
    readonly reason: string;
    readonly moderator: Snowflake;
    readonly type: CaseType;
}
