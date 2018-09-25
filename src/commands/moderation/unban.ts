import {Snowflake} from "discord.js";
import {Argument, ChatEnvironment, Command, Permission} from "discord-anvil";
import {PrimitiveArgType, RestrictGroup} from "discord-anvil/dist/commands/command";
import {CommandType} from "../general/help";
import CommandContext from "discord-anvil/dist/commands/command-context";

type UnbanArgs = {
    readonly user: Snowflake;
    readonly reason: string;
}

export default class Unban extends Command {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "unban",
        description: "Unban a user"
    };

    readonly arguments: Array<Argument> = [
        {
            name: "user",
            type: "snowflake",
            description: "The ID (Snowflake) of the user to unban",
            required: true
        },
        {
            name: "reason",
            description: "The reason for this moderation action",
            type: PrimitiveArgType.String,
            required: true
        }
    ];

    readonly restrict: any = {
        specific: [RestrictGroup.BotOwner],
        selfPermissions: [Permission.BanMembers],
        environment: ChatEnvironment.Guild
    };

    // TODO: Untested
    public async executed(context: CommandContext, args: UnbanArgs): Promise<void> {
        if (args.user === context.sender.id) {
            context.fail("You can't unban yourself.");

            return;
        }

        await context.message.guild.unban(args.user);
    }
};
