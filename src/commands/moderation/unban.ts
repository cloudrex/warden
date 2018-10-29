import {Snowflake} from "discord.js";
import {IArgument, ChatEnvironment, Command, Permission, TrivialArgType, RestrictGroup, CommandContext, InternalArgType} from "@cloudrex/forge";
import {CommandType} from "../general/help";

type UnbanArgs = {
    readonly user: Snowflake;
    readonly reason: string;
}

export default class UnbanCommand extends Command<UnbanArgs> {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "unban",
        description: "Unban a user"
    };

    readonly arguments: IArgument[] = [
        {
            name: "user",
            type: InternalArgType.Snowflake,
            switchShortName: "i",
            description: "The ID (Snowflake) of the user to unban",
            required: true
        },
        {
            name: "reason",
            description: "The reason for this moderation action",
            switchShortName: "r",
            type: TrivialArgType.String,
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
            await context.fail("You can't unban yourself.");

            return;
        }

        // TODO: Current executeAction() needs GuildMember
        await context.message.guild.unban(args.user);
    }
};
