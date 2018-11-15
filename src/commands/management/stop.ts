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

    public async executed(x: CommandContext): Promise<void> {
        await x.ok("Disconnecting");
        await x.bot.disconnect();
        process.exit(0);
    }
};
