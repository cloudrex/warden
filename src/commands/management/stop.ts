import {Command, CommandContext} from "forge";
import {CommandType} from "../general/help";
import {RestrictGroup} from "forge/dist/commands/command";

export default class StopCommand extends Command {
    readonly type = CommandType.Configuration;

    readonly meta = {
        name: "stop",
        description: "Disconnect the bot"
    };

    readonly aliases = ["disconnect", "quit"];

    readonly restrict: any = {
        specific: [RestrictGroup.BotOwner]
    };

    public async executed(context: CommandContext): Promise<void> {
        await context.ok("Disconnecting");
        await context.bot.disconnect();
        process.exit(0);
    }
};
