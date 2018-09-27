<<<<<<< HEAD
import {Service, ServiceOptions, on} from "discord-anvil";
import {Snowflake, Message} from "discord.js";
import {DiscordEvent} from "discord-anvil/dist/decorators/decorators";
=======
import {Service, ServiceOptions} from "discord-anvil";
import {Snowflake, Message} from "discord.js";
import {DiscordEvent, on, BotEvents} from "discord-anvil/dist/decorators/decorators";
>>>>>>> 1dcadfa15338ca5ef6f8da148da4c02b98c18d42

export default class AntiRaidService extends Service {
    readonly meta = {
        name: "anti-raid",
        description: "Unattended raid protection system"
    };

<<<<<<< HEAD
    public readonly memory: Map<Snowflake, Message>;
=======
    readonly memory: Map<Snowflake, Array<Message>>;
>>>>>>> 1dcadfa15338ca5ef6f8da148da4c02b98c18d42

    constructor(options: ServiceOptions) {
        super(options);

<<<<<<< HEAD
        console.log("service init -> antiraid ==> " + DiscordEvent.Message);

        this.memory = new Map();
    }

    @on(DiscordEvent.Message)
    public handleMessage(message: Message): void {
        console.log(`From AntiRaid service => ${message.content}`);
    }

=======
        this.memory = new Map();
    }

>>>>>>> 1dcadfa15338ca5ef6f8da148da4c02b98c18d42
    public start(): void {
        // Register listeners
        this.bot.client.on(DiscordEvent.Message, (message: Message) => {
            console.log("bot owner is ", this.bot.owner);
        });
    }
}