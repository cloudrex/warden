import {Snowflake} from "discord.js";

export type ThresholdFeature = {
    readonly enabled: boolean;
    readonly threshold: number;
};

export const DefaultAutonomousProtectionOptions: AutonomousProtectionOptions = {
    antiAds: true,
    antiHoisting: false,
    antiRaid: false,
    antiSpam: false,
    antiZalgo: false,
    autoBackups: false,
    swearFilter: false,

    globalBans: {
        enabled: false,
        threshold: 10
    }
};

export type AutonomousProtectionOptions = {
    readonly antiSpam: boolean; // Anti-spam is prevention of repetitive, similar messages
    readonly swearFilter: boolean;
    readonly antiAds: boolean;
    readonly antiHoisting: boolean;
    readonly antiZalgo: boolean; // Anti-zalgo is for messages, not usernames/nicknames
    readonly antiRaid: boolean;
    readonly autoBackups: boolean;
    readonly globalBans: ThresholdFeature; // Auto-bans users who have been banned in (>= threshold) servers
};

export type GuildCustomCommand = {
    readonly command: string;
    readonly response: string;
};

export type DatabaseGuildChannels = {
    readonly modLog: Snowflake;
    readonly welcome: Snowflake;
    readonly memberLog: Snowflake; // When members leave/join
};

export const DefaultDatabaseGuildReports: DatabaseGuildReports = {
    dailyReports: false,

    moderationReports: {
        enabled: false,
        threshold: 1
    },

    raidReports: true,
    weeklyReports: false
};

export type DatabaseGuildReports = {
    readonly raidReports: boolean; // Generates a report and sends it to the guild owner if he was offline during a raid
    readonly weeklyReports: boolean; // Generates a weekly report of the moderation actions carried in the guild + guild statistics (sent to guild owners only)
    readonly dailyReports: boolean; // Same as weeklyReports, but in a daily basis (sent to guild owners only)
    readonly moderationReports: ThresholdFeature; // Generates a report of moderation actions if the moderator/owner was gone for a long time
};

export const DefaultDatabaseGuildConfig: PartialDatabaseGuildConfig = {
    dataCollection: true,
    protectionOptions: DefaultAutonomousProtectionOptions,
    slowMode: false,
    reports: DefaultDatabaseGuildReports
};

export interface DatabaseGuildConfig extends PartialDatabaseGuildConfig {
    readonly guildId: Snowflake;
    readonly channels: DatabaseGuildChannels;
}

export type PartialDatabaseGuildConfig = {
    readonly customPrefix?: string;
    readonly protectionOptions: AutonomousProtectionOptions;
    readonly bannedWords?: string[]; // swearFilter must be TRUE
    readonly domainWhitelist?: string[]; // useWhitelist must be TRUE
    readonly domainBlacklist?: string[]; // useWhitelist must be FALSE
    readonly useWhitelist?: boolean; // true -> whitelist, false -> blacklist, undefined -> none
    readonly customCommands?: Array<GuildCustomCommand>;
    readonly slowModeChannels?: Array<Snowflake>; // slowMode must be TRUE
    readonly slowMode: boolean; // Whether slow-mode features are enabled
    readonly ignoredChannels?: Array<Snowflake>;
    readonly reports: DatabaseGuildReports;
    readonly dataCollection: boolean; // Allow collection of data such as messages, members and server configuration to help improve Warden's development
};
