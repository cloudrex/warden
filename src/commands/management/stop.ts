import {Command, CommandContext, RestrictGroup} from "@cloudrex/forge";
import {CommandType} from "../general/help";

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
