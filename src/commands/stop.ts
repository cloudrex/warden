import {Command, CommandContext} from "discord-anvil";
import SpecificGroups from "../specific-groups";

export default class Stop extends Command {
    readonly meta = {
        name: "stop",
        description: "Disconnect the bot"
    };

    readonly aliases = ["disconnect", "quit"];

    constructor() {
        super();

        this.restrict.specific = SpecificGroups.owner;
    }

    public async executed(context: CommandContext): Promise<void> {
        await context.ok("Disconnecting.");
        await context.bot.disconnect();
        process.exit(0);
    }
};
