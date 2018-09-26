import {Service, ServiceOptions} from "discord-anvil";
import {Snowflake, Message} from "discord.js";
import {DiscordEvent, on, BotEvents} from "discord-anvil/dist/decorators/decorators";

export default class AntiRaidService extends Service {
    readonly meta = {
        name: "anti-raid",
        description: "Unattended raid protection system"
    };

    readonly memory: Map<Snowflake, Array<Message>>;

    constructor(options: ServiceOptions) {
        super(options);

        this.memory = new Map();
    }

    public start(): void {
        // Register listeners
        this.bot.client.on(DiscordEvent.Message, (message: Message) => {
            console.log("bot owner is ", this.bot.owner);
        });
    }
}