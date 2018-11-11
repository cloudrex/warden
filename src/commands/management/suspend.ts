import {Command, CommandContext, RestrictGroup} from "@cloudrex/forge";
import {CommandType} from "../general/help";

export default class SuspendCommand extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "suspend",
        description: "Suspend the bot"
    };

    readonly restrict: any = {
        specific: [RestrictGroup.BotOwner]
    };

    public async executed(context: CommandContext): Promise<void> {
        await context.ok(":zzz: Entering suspension state");
        context.bot.suspend(true);
    }
};
