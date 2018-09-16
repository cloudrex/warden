import {Snowflake} from "discord.js";
import {ChatEnvironment, Command, CommandArgument, CommandContext, Permission} from "discord-anvil";
import {CommandRestrictGroup, PrimitiveArgumentType} from "discord-anvil/dist/commands/command";
import {CommandType} from "./help";

interface UnbanArgs {
    readonly user: Snowflake;
    readonly reason: string;
}

export default class Unban extends Command {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "unban",
        description: "Unban a user"
    };

    readonly arguments: Array<CommandArgument> = [
        {
            name: "user",
            type: "snowflake",
            description: "The ID (Snowflake) of the user to unban",
            required: true
        },
        {
            name: "reason",
            description: "The reason for this moderation action",
            type: PrimitiveArgumentType.String,
            required: true
        }
    ];

    constructor() {
        super();

        this.restrict.environment = ChatEnvironment.Guild;
        this.restrict.selfPermissions = [Permission.BanMembers];
        this.restrict.specific = [CommandRestrictGroup.BotOwner];
    }

    // TODO: Untested
    public async executed(context: CommandContext, args: UnbanArgs): Promise<void> {
        if (args.user === context.sender.id) {
            context.fail("You can't unban yourself.");

            return;
        }

        await context.message.guild.unban(args.user);
    }
};
