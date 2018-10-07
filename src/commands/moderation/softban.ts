import {GuildMember} from "discord.js";
import {Argument, Command, Permission} from "forge";
import {PrimitiveArgType, RestrictGroup} from "forge/dist/commands/command";
import WardenAPI from "../../core/warden-api";
import {CommandType} from "../general/help";
import CommandContext from "forge/dist/commands/command-context";
import {ModerationActionType} from "../../database/mongo-database";

type SoftbanArgs = {
    readonly member: GuildMember;
    readonly reason: string;
    readonly evidence?: string;
}

export default class SoftbanCommand extends Command {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "softban",
        description: "Softban a user"
    };

    readonly arguments: Array<Argument> = [
        {
            name: "member",
            type: "member",
            description: "The member to softban",
            required: true
        },
        {
            name: "reason",
            description: "The reason for this moderation action",
            type: PrimitiveArgType.String,
            required: true
        },
        {
            name: "evidence",
            description: "The evidence of the reason",
            type: PrimitiveArgType.String
        }
    ];

    readonly restrict: any = {
        issuerPermissions: [Permission.BanMembers],
        selfPermissions: [Permission.BanMembers]
    };

    public async executed(context: CommandContext, args: SoftbanArgs, api: WardenAPI): Promise<void> {
        if (args.member.id === context.sender.id) {
            await context.fail("You can't softban yourself.");

            return;
        }
        else if (!args.member.bannable) {
            await context.fail("Unable to softban that person.");

            return;
        }

        await api.executeAction({
            member: args.member,
            reason: args.reason,
            evidence: args.evidence,
            moderator: context.message.member,
            type: ModerationActionType.Softban
        });

        await context.message.guild.unban(args.member.id, "Softban");
    }
};
