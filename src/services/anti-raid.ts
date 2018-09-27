import {Service, ServiceOptions, on} from "discord-anvil";
import {Snowflake, Message} from "discord.js";
import {DiscordEvent} from "discord-anvil/dist/decorators/decorators";

export default class AntiRaidService extends Service {
    readonly meta = {
        name: "anti-raid",
        description: "Unattended raid protection system"
    };

    public readonly memory: Map<Snowflake, Message>;

    constructor(options: ServiceOptions) {
        super(options);

        console.log("service init -> antiraid ==> " + DiscordEvent.Message);

        this.memory = new Map();
    }

    @on(DiscordEvent.Message)
    public handleMessage(message: Message): void {
        console.log(`From AntiRaid service => ${message.content}`);
    }

    public start(): void {
        //
    }
}