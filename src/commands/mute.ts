import {WardenAPI} from "../warden-api";
import {ChatEnvironment, Command, CommandArgument, CommandContext, Permission} from "discord-anvil";
import SpecificGroups from "../specific-groups";
import {GuildMember} from "discord.js";
import {PrimitiveArgumentType} from "discord-anvil/dist/commands/command";

export interface MuteArgs {
    readonly member: GuildMember;
    readonly reason: string;
    readonly evidence?: string;
}

export default class Mute extends Command {
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
            name: "evidence",
            description: "The evidence of the reason",
            type: PrimitiveArgumentType.String
        }
    ];

    constructor() {
        super();

        this.restrict.selfPermissions = [Permission.ManageRoles];
        this.restrict.issuerPermissions = [Permission.ManageRoles];
        this.restrict.environment = ChatEnvironment.Guild;
        this.restrict.specific = SpecificGroups.staff;
    }

    // TODO: Where is it adding the muted role?
    public async executed(context: CommandContext, args: MuteArgs, api: WardenAPI): Promise<void> {
        await api.reportCase({
            member: args.member,
            title: "Mute",
            evidence: args.evidence,
            moderator: context.message.author,
            reason: args.reason,
            color: "GOLD"
        });
    }
};
