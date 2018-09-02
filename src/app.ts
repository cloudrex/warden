import WardenApi, {WardenAPI} from "./warden-api";
import {Guild, GuildMember, Message, TextChannel} from "discord.js";
import path from "path";
import {
    ArgumentTypeChecker,
    Bot,
    JsonAuthStore,
    JsonProvider,
    Log,
    LogLevel,
    Settings,
    UserDefinedArgType,
    Utils
} from "discord-anvil";
import {CommandArgumentResolver} from "discord-anvil/dist/commands/command";

const baseDir: string = "./src";

Log.level = LogLevel.Debug;

const settings = new Settings({
    general: {
        token: process.env.token ? process.env.token : "",
        prefixes: process.env.prefix ? process.env.prefix.split(",") : ["!"]
    },

    paths: {
        commands: path.resolve(path.join(__dirname, "./commands")),
        services: path.resolve(path.join(__dirname, "./services"))
    }
});

async function start() {
    const userMentionRegex = /(^[0-9]{17,18}$|^<@!?[0-9]{17,18}>$)/;

    const bot: Bot = new Bot({
        argumentTypes: <Array<UserDefinedArgType>>[
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

        argumentResolvers: <Array<CommandArgumentResolver>>[
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
        owner: "285578743324606482"
    });

    if (bot.dataStore) {
        const store: JsonProvider = bot.dataStore as JsonProvider;

        await store.reload();

        const api: WardenAPI = new WardenAPI({
            guild: "286352649610199052",
            databasePath: "warden.db",
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
        api.setup();

        //////////////
        WardenApi.store = store;

        const storedCounter = store.get("case_counter");

        WardenApi.caseCounter = storedCounter ? storedCounter : 0;

        const gamingCorner: Guild | null = bot.client.guilds.get("286352649610199052") || null;

        if (gamingCorner !== null) {
            const modLogChannel: TextChannel = gamingCorner.channels.get("458794765308395521") as TextChannel;

            if (modLogChannel) {
                WardenApi.modLogChannel = modLogChannel;
            }
            else {
                Log.error("[:Consumer.start] The ModLog channel was not found");
            }
        }
        else {
            Log.error("[:Consumer.start] The Gaming Corner guild was not found");
        }
    }
}

start();
