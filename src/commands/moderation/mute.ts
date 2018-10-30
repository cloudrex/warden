import WardenAPI from "../../core/warden-api";
import {ChatEnvironment, Command, IArgument, CommandContext, Permission, RestrictGroup, TrivialArgType, InternalArgType} from "@cloudrex/forge";
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

    readonly arguments: IArgument[] = [
        {
            name: "member",
            description: "The member to mute",
            switchShortName: "u",
            type: InternalArgType.Member,
            required: true
        },
        {
            name: "reason",
            description: "The reason for this moderation action",
            switchShortName: "r",
            type: TrivialArgType.String,
            required: true
        },
        {
            name: "time",
            description: "The time to mute the user",
            switchShortName: "t",
            type: TrivialArgType.NonZeroInteger,
            required: false,
        },
        {
            name: "evidence",
            description: "The evidence of the reason",
            switchShortName: "e",
            type: TrivialArgType.String,
            required: false
        }
    ];

    readonly restrict: any = {
        selfPermissions: [Permission.ManageRoles],
        specific: [RestrictGroup.ServerModerator],
        environment: ChatEnvironment.Guild
    };

    public async executed(context: CommandContext, args: MuteArgs, api: WardenAPI): Promise<void> {
        if (args.member.id === context.sender.id) {
            await context.fail("You can't mute yourself silly.");

            return;
        }

        await api.executeAction(context.message.channel as TextChannel, {
            member: args.member,
            type: ModerationActionType.Mute,
            evidence: args.evidence,
            moderator: context.message.member,
            reason: args.reason,

            // TODO:
            // end: args.time ? Date.now() + (args.time * 60000) : undefined
        });
    }
};
