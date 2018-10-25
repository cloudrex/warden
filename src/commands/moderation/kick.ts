import {GuildMember, TextChannel} from "discord.js";
import WardenAPI from "../../core/warden-api";
import {Command, IArgument, CommandContext, Permission, TrivialArgType, InternalArgType, ChatEnvironment} from "@cloudrex/forge";
import {CommandType} from "../general/help";
import {ModerationActionType} from "../../database/mongo-database";

export type KickArgs = {
    readonly member: GuildMember;
    readonly reason: string;
    readonly evidence?: string;
}

export default class KickCommand extends Command<KickArgs> {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "kick",
        description: "Kick a member"
    };

    readonly arguments: IArgument[] = [
        {
            name: "member",
            description: "The member to kick",
            type: InternalArgType.Member,
            required: true
        },
        {
            name: "reason",
            description: "The reason for this moderation action",
            type: TrivialArgType.String,
            required: true
        },
        {
            name: "evidence",
            description: "Evidence for the reason",
            type: TrivialArgType.String,
            required: false
        }
    ];

    readonly restrict: any = {
        issuerPermissions: [Permission.KickMembers],
        selfPermissions: [Permission.KickMembers],
        environment: ChatEnvironment.Guild
    };

    public async executed(context: CommandContext, args: KickArgs, api: WardenAPI): Promise<void> {
        if (args.member.id === context.sender.id) {
            await context.fail("You can't kick yourself silly.");

            return;
        }
        else if (!args.member.kickable) {
            await context.fail("Unable to kick that person.");

            return;
        }

        await api.executeAction(context.message.channel as TextChannel, {
            type: ModerationActionType.Kick,
            reason: args.reason,
            member: args.member,
            evidence: args.evidence,
            moderator: context.message.member
        });
    }
};
