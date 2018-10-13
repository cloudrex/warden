import WardenAPI from "../../core/warden-api";
import {ChatEnvironment, Command, Argument, CommandContext, Permission, RestrictGroup, PrimitiveArgType} from "forge";
import {GuildMember, TextChannel} from "discord.js";
import {CommandType} from "../general/help";
import {ModerationActionType} from "../../database/mongo-database";

type MuteArgs = {
    readonly member: GuildMember;
    readonly reason: string;
    readonly time?: number;
    readonly evidence?: string;
}

export default class MuteCommand extends Command {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "mute",
        description: "Mute a user"
    };

    readonly arguments: Argument[] = [
        {
            name: "member",
            description: "The member to mute",
            type: "member",
            required: true
        },
        {
            name: "reason",
            description: "The reason for this moderation action",
            type: PrimitiveArgType.String,
            required: true
        },
        {
            name: "time",
            description: "The time to mute the user",
            type: PrimitiveArgType.NonZeroInteger,
            required: false,
        },
        {
            name: "evidence",
            description: "The evidence of the reason",
            type: PrimitiveArgType.String,
            required: false
        }
    ];

    readonly restrict: any = {
        selfPermissions: [Permission.ManageRoles],
        specific: [RestrictGroup.ServerModerator],
        environment: ChatEnvironment.Guild
    };

    public async executed(context: CommandContext, args: MuteArgs, api: WardenAPI): Promise<void> {
        await api.executeAction(context.message.channel as TextChannel, {
            member: args.member,
            type: ModerationActionType.Mute,
            evidence: args.evidence,
            moderator: context.message.member,
            reason: args.reason,
            end: args.time ? Date.now() + (args.time * 60000) : undefined
        });
    }
};
