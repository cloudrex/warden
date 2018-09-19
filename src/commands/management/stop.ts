import {Command, CommandContext} from "discord-anvil";
import {CommandType} from "../general/help";
import {RestrictGroup} from "discord-anvil/dist/commands/command";

export default class Stop extends Command {
    readonly type = CommandType.Configuration;

    readonly meta = {
        name: "stop",
        description: "Disconnect the bot"
    };

    readonly aliases = ["disconnect", "quit"];

    constructor() {
        super();

        this.restrict.specific = [RestrictGroup.BotOwner];
    }

    public async executed(context: CommandContext): Promise<void> {
        await context.ok("Disconnecting.");
        await context.bot.disconnect();
        process.exit(0);
    }
};
