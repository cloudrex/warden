import {GuildMember, TextChannel} from "discord.js";
import {IArgument, Command, Permission, PrimitiveArgType, CommandContext, InternalArgType} from "@cloudrex/forge";
import WardenAPI from "../../core/warden-api";
import {CommandType} from "../general/help";
import {ModerationActionType} from "../../database/mongo-database";
import ChatEnvironment from "@cloudrex/forge/core/chat-environment";

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

    readonly arguments: IArgument[] = [
        {
            name: "member",
            type: InternalArgType.Member,
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
        selfPermissions: [Permission.BanMembers],
        environment: ChatEnvironment.Guild
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

        await api.executeAction(context.message.channel as TextChannel, {
            member: args.member,
            reason: args.reason,
            evidence: args.evidence,
            moderator: context.message.member,
            type: ModerationActionType.Softban
        });

        await context.message.guild.unban(args.member.id, "Softban");
    }
};
