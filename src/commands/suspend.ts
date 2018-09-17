import {Command, CommandContext, Permission, Utils} from "discord-anvil";
import {CommandType} from "./help";

export default class Suspend extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "suspend",
        description: "Suspend the bot"
    };

    public async executed(context: CommandContext): Promise<void> {
        await context.ok("<:internal:490724708837359628> Entering suspension state");
        context.bot.suspended = true;
    }
};
