import {Command, CommandContext, Permission, Utils} from "discord-anvil";
import {CommandType} from "../general/help";
import {RestrictGroup} from "discord-anvil/dist/commands/command";

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
        await context.ok("<:internal:490724708837359628> Entering suspension state");
        context.bot.suspended = true;
    }
};
