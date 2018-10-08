// Environment variables
require("dotenv").config();

import Mongo from "./database/mongo-database";
import {GuildMember, Message, Snowflake} from "discord.js";
import path from "path";

import {
    ArgumentTypeChecker,
    Bot,
    CustomArgType,
    JsonAuthStore,
    JsonProvider,
    Log,
    LogLevel,
    Settings,
    Utils,
    on
} from "forge";

import {ArgumentResolver} from "forge/dist/commands/command";
import WardenAPI from "./core/warden-api";

const baseDir: string = "./src";

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
    readonly channelReview: Snowflake;
    readonly guild: Snowflake;
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
    "channelReview",
    "guild"
];

export const config: BotConfig = {
    channelModLog: process.env.channel_mod_log as Snowflake,
    roleMuted: process.env.role_muted as Snowflake,
    channelSuggestions: process.env.channel_suggestions as Snowflake,
    globalTracking: process.env.global_tracking === "true" ? true : false,
    inviteProtection: process.env.invite_protection === "true" ? true : false,
    persistentRoles: process.env.persistent_roles === "true" ? true : false,
    antiHoisting: process.env.anti_hoisting === "true" ? true : false,
    logMembers: process.env.log_members === "true" ? true : false,
    announceJoins: process.env.announce_joins === "true" ? true : false,
    antiSpam: process.env.anti_spam === "true" ? true : false,
    channelReview: process.env.channel_review as Snowflake,
    guild: process.env.guild as Snowflake
};

function checkConfig(): void {
    for (let i = 0; i < requiredConfig.length; i++) {
        if (config[requiredConfig[i]] === undefined || config[requiredConfig[i]] === null || config[requiredConfig[i]] === "") {
            throw new Error(`[checkConfig] Required configuration property missing: ${requiredConfig[i]}`);
        }
    }
}

checkConfig();

console.log(`\nUsing configuration\n\n`, config, "\n");

const settings = new Settings({
    general: {
        token: process.env.token || "",
        prefixes: process.env.prefix ? process.env.prefix.split(",") : ["."]
    },

    paths: {
        commands: path.resolve(path.join(__dirname, "./commands")),
        services: path.resolve(path.join(__dirname, "./services"))
    }
});

async function start() {
    const userMentionRegex = /(^[0-9]{17,18}$|^<@!?[0-9]{17,18}>$)/;

    const bot: Bot = new Bot({
        argumentTypes: <Array<CustomArgType>>[
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

        argumentResolvers: <Array<ArgumentResolver>>[
            {
                name: "member",

                resolve: (argument: string, message: Message): GuildMember => {
                    return message.guild.member(Utils.resolveId(argument));
                }
            }
        ],

        settings: settings,
        authStore: new JsonAuthStore(path.resolve(path.join(baseDir, "auth/schema.json")), path.resolve(path.join(baseDir, "auth/store.json"))),
        dataStore: new JsonProvider(path.resolve(path.join(__dirname, "data.json"))),
        owner: "285578743324606482",

        options: {
            logMessages: false,
            consoleInterface: true,
            updateOnMessageEdit: true,

            emojis: {
                success: "<:success:490723457898643456>",
                error: "<:error:490723363329671222>"
            }
        },

        primitiveCommands: [
            "usage",
            "ping",
            "auth",
            "prefix",
            "throw"
        ]
    });

    const api: WardenAPI = new WardenAPI(bot);

    await (await bot.setup(api)).connect();
    api.setup();

    // Database Setup
    Log.debug("Setting up mongodb database");
    await Mongo.connect();
    Log.debug("Mongodb database setup completed");
}

start();
