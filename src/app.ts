// Environment variables
require("dotenv").config();

import Mongo from "./database/mongo-database";
import {GuildMember, Message, Snowflake} from "discord.js";
import path from "path";

import {
    Bot, IArgumentResolver,
    JsonProvider,
    Log,
    LogLevel,
    Settings,
    Utils
} from "@cloudrex/forge";

import WardenAPI from "./core/warden-api";

Log.level = LogLevel.Debug;

type BotConfig = {
    readonly channelModLog: Snowflake;
    readonly channelSuggestions: Snowflake;
    readonly roleMuted: Snowflake;
    readonly globalTracking: boolean;
    readonly inviteProtection: boolean;
    readonly persistentRoles: boolean;
    readonly antiHoisting: boolean;
    readonly logMembers: boolean;
    readonly announceJoins: boolean;
    readonly antiSpam: boolean;
    readonly antiSpamThreshold: number;
    readonly channelReview: Snowflake;
    readonly guild: Snowflake;
    readonly dbHost?: string;
    readonly dbUrl?: string;
    readonly dbPort?: number;
    readonly dbName?: string;
    readonly token: string;
    readonly banAdsOnName: boolean;
}

const requiredConfig: string[] = [
    "channelModLog",
    "channelSuggestions",
    "roleMuted",
    "globalTracking",
    "inviteProtection",
    "persistentRoles",
    "antiHoisting",
    "logMembers",
    "announceJoins",
    "antiSpam",
    "antiSpamThreshold",
    "channelReview",
    "guild",
    "token"
];

export const config: BotConfig = {
    channelModLog: process.env.CHANNEL_MOD_LOG as Snowflake,
    roleMuted: process.env.ROLE_MUTED as Snowflake,
    channelSuggestions: process.env.CHANNEL_SUGGESTIONS as Snowflake,
    globalTracking: process.env.GLOBAL_TRACKING === "true",
    inviteProtection: process.env.INVITE_PROTECTION === "true",
    persistentRoles: process.env.PERSISTENT_ROLES === "true",
    antiHoisting: process.env.ANTI_HOISTING === "true",
    logMembers: process.env.LOG_MEMBERS === "true",
    announceJoins: process.env.ANNOUNCE_JOINS === "true",
    antiSpam: process.env.ANTI_SPAM === "true",
    antiSpamThreshold: parseInt(process.env.ANTI_SPAM_THRESHOLD as string),
    channelReview: process.env.CHANNEL_REVIEW as Snowflake,
    guild: process.env.GUILD as Snowflake,
    dbHost: process.env.DB_HOST || undefined,
    dbUrl: process.env.DB_URL || undefined,
    dbPort: parseInt(process.env.DB_PORT as string) || undefined,
    dbName: process.env.DB_NAME || undefined,
    token: process.env.TOKEN as string,
    banAdsOnName: process.env.BAN_ADS_ON_NAME === "true"
};

function checkConfig(): void {
    for (let i: number = 0; i < requiredConfig.length; i++) {
        if (config[requiredConfig[i]] === undefined || config[requiredConfig[i]] === null || config[requiredConfig[i]] === "" || (typeof config[requiredConfig[i]] !== "string" && isNaN(config[requiredConfig[i]]))) {
            throw new Error(`[checkConfig] Required configuration property missing: ${requiredConfig[i]}`);
        }
    }
}

checkConfig();

console.log(`\nUsing configuration\n\n`, config, "\n");

const settings = new Settings({
    general: {
        token: config.token,
        prefixes: process.env.PREFIX ? process.env.PREFIX.split(",") : ["."]
    },

    paths: {
        commands: path.resolve(path.join(__dirname, "./commands")),
        services: path.resolve(path.join(__dirname, "./services"))
    }
});

async function start() {
    const userMentionRegex = /(^[0-9]{17,18}$|^<@!?[0-9]{17,18}>$)/;

    const bot: Bot = new Bot({
        argumentTypes: [
            {
                name: "user",
                check: userMentionRegex,
            },
            // TODO: Should check if it exists in guild
            {
                name: "role",
                check: /(^[0-9]{18}$|^<&[0-9]{18}>$)/
            },
            // TODO: Should check if it exists in guild
            {
                name: "channel",
                check: /(^[0-9]{18}$|^<#[0-9]{18}>$)/
            },
            // TODO: Should check if it exists in guild
            {
                name: "member",

                check: (argument: any, message: Message): boolean => {
                    return message.guild.members.has(Utils.resolveId(argument));
                }
            }
        ],

        argumentResolvers: <IArgumentResolver[]>[
            {
                name: "member",

                resolve: (argument: string, message: Message): GuildMember => {
                    return message.guild.member(Utils.resolveId(argument));
                }
            }
        ],

        settings: settings,
        dataStore: new JsonProvider(path.resolve(path.join(__dirname, "data.json"))),
        owner: "285578743324606482",

        options: {
            logMessages: false,
            consoleInterface: true,
            updateOnMessageEdit: true
        },

        primitiveCommands: [
            "usage",
            "ping",
            "prefix",
            "throw",
            "cli",
            "restart"
        ]
    });

    // Database Setup
    Log.debug("Setting up mongodb database");
    await Mongo.connect();
    Log.debug("Mongodb database setup completed");

    // Bot setup & connect
    const api: WardenAPI = new WardenAPI(bot);

    await bot.connect(api);
    api.setup();
}

start();
