import {Command, CommandContext} from "discord-anvil";
import SpecificGroups from "../specific-groups";
import {CommandType} from "./help";
import {CommandRestrictGroup} from "discord-anvil/dist/commands/command";

export default class Stop extends Command {
    readonly type = CommandType.Configuration;

    readonly meta = {
        name: "stop",
        description: "Disconnect the bot"
    };

    readonly aliases = ["disconnect", "quit"];

    constructor() {
        super();

        this.restrict.specific = [CommandRestrictGroup.BotOwner];
    }

    public async executed(context: CommandContext): Promise<void> {
        await context.ok("Disconnecting.");
        await context.bot.disconnect();
        process.exit(0);
    }
};
