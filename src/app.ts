// .env
require("dotenv").config();

import Mongo from "./database/mongo-database";
import {GuildMember, Message} from "discord.js";
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

    const api: WardenAPI = new WardenAPI({
        guild: "286352649610199052",
        bot: bot,

        // Gaming corner
        channels: {
            suggestions: "458337067299242004",
            modLog: "458794765308395521",
            review: "464911303291699210",
            votes: "471067993158451210",
            decisions: "471068005959467011",
            changes: "471068072141389824"
        },

        roles: {
            muted: "463500384812531715"
        }
    });

    await (await bot.setup(api)).connect();
    await api.setup();

    // Database Setup
    Log.debug("Setting up mongodb database");
    await Mongo.connect();
    Log.debug("Mongodb database setup completed");
}

start();
