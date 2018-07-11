import WardenApi, {ConsumerAPIv2} from "./warden-api";
import {TextChannel} from "discord.js";
import Log from "discord-anvil/dist/core/log";
import {LogLevel} from "discord-anvil/dist";
import Settings from "discord-anvil/dist/core/settings";
import Bot from "discord-anvil/dist/core/bot";
import JsonAuthStore from "discord-anvil/dist/commands/auth-stores/json-auth-store";
import JsonProvider from "discord-anvil/dist/data-providers/json-provider";

const path = require("path");
const baseDir = "./src";

Log.level = LogLevel.Debug;

////////////////// test
/* const qb = new SqlQuery("warnings");

qb.insert({
    username: "test",
    age: 15
});

console.log(qb.build()); */
////////////////// test

const settings = new Settings({
    general: {
        token: process.env.AC_TOKEN ? process.env.AC_TOKEN : "",
        prefixes: process.env.AC_PREFIX ? process.env.AC_PREFIX.split(",") : ["!"]
    },

    paths: {
        commands: path.resolve(path.join(__dirname, "./commands")),
        behaviours: path.resolve(path.join(__dirname, "./behaviours"))
    }
});

/* const mongoUrl = "mongodb://localhost:27017";

const stores: any = {
    warnings: new MongoDbProviderV2(mongoUrl, "warnings")
}; */

/* async function setupStores() {
    const storesKeys: Array<string> = Object.keys(stores);

    for (let i: number = 0; i < storesKeys.length; i++) {
        await stores[storesKeys[i]].connect();
    }
} */

async function start() {
    const userMentionRegex = /(^[0-9]{17,18}$|^<@!?[0-9]{17,18}>$)/;

    const bot = new Bot({
        argumentTypes: {
            user: userMentionRegex,
            role: /(^[0-9]{18}$|^<&[0-9]{18}>$)/,
            channel: /(^[0-9]{18}$|^<#[0-9]{18}>$)/,
            member: userMentionRegex
        },

        settings: settings,

        authStore: new JsonAuthStore(path.resolve(path.join(baseDir, "auth/schema.json")), path.resolve(path.join(baseDir, "auth/store.json"))),

        dataStore: new JsonProvider(path.resolve(path.join(__dirname, "data.json"))),

        autoDeleteCommands: false,

        owner: "285578743324606482",

        updateOnMessageEdit: true
    });

    if (bot.dataStore) {
        const store: JsonProvider = <JsonProvider>bot.dataStore;

        await store.reload();

        const api: ConsumerAPIv2 = new ConsumerAPIv2({
            guild: "286352649610199052",
            bot: bot,

            channels: {
                suggestions: "458337067299242004",
                modLog: "458794765308395521",
                review: "464911303291699210"
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

        const gamingCorner = bot.client.guilds.get("286352649610199052");

        if (gamingCorner) {
            const modLogChannel: TextChannel = <TextChannel>gamingCorner.channels.get("458794765308395521");

            if (modLogChannel) {
                WardenApi.modLogChannel = modLogChannel;
            }
            else {
                Log.error("[Consumer.start] The ModLog channel was not found");
            }
        }
        else {
            Log.error("[Consumer.start] The Gaming Corner guild was not found");
        }

        /* await ConsumerAPI.reportCase({
            color: "RED",
            reason: "test",
            moderator: bot.client.guilds.get("286352649610199052").member("439373663905513473"),
            member: bot.client.guilds.get("286352649610199052").member("285578743324606482"),
            title: "Ban"
        }); */
    }
}

// setupStores();
start();