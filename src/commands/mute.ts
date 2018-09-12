import WardenAPI from "../core/warden-api";
import {ChatEnvironment, Command, CommandArgument, CommandContext, Permission} from "discord-anvil";
import SpecificGroups from "../specific-groups";
import {GuildMember} from "discord.js";
import {PrimitiveArgumentType} from "discord-anvil/dist/commands/command";
import {CommandType} from "./help";
import {ModerationActionType} from "../database/mongo-database";

export interface MuteArgs {
    readonly member: GuildMember;
    readonly reason: string;
    readonly time?: number;
    readonly evidence?: string;
}

export default class Mute extends Command {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "mute",
        description: "Mute a user"
    };

    readonly arguments: Array<CommandArgument> = [
        {
            name: "member",
            description: "The member to mute",
            type: "member",
            required: true
        },
        {
            name: "reason",
            description: "The reason for this moderation action",
            type: PrimitiveArgumentType.String,
            required: true
        },
        {
            name: "time",
            description: "The time to mute the user",
            type: PrimitiveArgumentType.NonZeroInteger,
            required: false,
        },
        {
            name: "evidence",
            description: "The evidence of the reason",
            type: PrimitiveArgumentType.String,
            required: false
        }
    ];

    constructor() {
        super();

        this.restrict.selfPermissions = [Permission.ManageRoles];
        this.restrict.issuerPermissions = [Permission.ManageRoles];
        this.restrict.environment = ChatEnvironment.Guild;
        this.restrict.specific = SpecificGroups.staff;
    }

    public async executed(context: CommandContext, args: MuteArgs, api: WardenAPI): Promise<void> {
        await api.executeAction({
            member: args.member,
            type: ModerationActionType.Mute,
            evidence: args.evidence,
            moderator: context.message.member,
            reason: args.reason,
            end: args.time ? Date.now() + (args.time * 60000) : undefined
        });
    }
};
