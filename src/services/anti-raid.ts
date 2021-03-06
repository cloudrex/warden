import {Service, IServiceOptions, Utils, DiscordEvent} from "@cloudrex/forge";
import {Snowflake, Message} from "discord.js";
import {compareTwoStrings} from "string-similarity";
import {config} from "../app";

const threshold: number = 70;

export default class AntiRaidService extends Service {
    readonly meta = {
        name: "anti-raid",
        description: "Unattended raid protection system"
    };

    public static readonly memory: Map<Snowflake, Message[]> = new Map();

    constructor(options: IServiceOptions) {
        super(options);

        AntiRaidService.memory.clear();
    }

    private async handleMessage(message: Message): Promise<void> {
        if (!config.antiSpam || message.author.bot || message.channel.type !== "text" || Utils.hasModerationPowers(message.member)) {
            return;
        }
        else if (AntiRaidService.memory.has(message.author.id)) {
            (AntiRaidService.memory.get(message.author.id) as Message[]).push(message);
        }
        else {
            AntiRaidService.memory.set(message.author.id, [message]);
        }

        const messages: Message[] = AntiRaidService.memory.get(message.author.id) as Message[];

        if (messages.length < 2) {
            return;
        }

        const previousMessage: Message = messages[messages.length - 2];
        const similarity: number = compareTwoStrings(message.content, previousMessage.content);

        if (similarity >= threshold / 100 && message.deletable) {
            await message.delete();

            const response: Message = await message.reply("Please refrain from spamming") as Message;

            if (response) {
                await response.delete(4000);
            }
        }
    }

    public start(): void {
        // Register listeners
        this.bot.client.on(DiscordEvent.Message, this.handleMessage.bind(this));
    }

    public dispose(): void {
        this.bot.client.removeListener(DiscordEvent.Message, this.handleMessage);
        AntiRaidService.memory.clear();
    }
}
