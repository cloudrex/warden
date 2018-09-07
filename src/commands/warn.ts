import {WardenAPI} from "../warden-api";
import {ChatEnvironment, Command, CommandArgument, CommandContext, Utils} from "discord-anvil";
import SpecificGroups from "../specific-groups";
import {PrimitiveArgumentType} from "discord-anvil/dist/commands/command";
import {GuildMember} from "discord.js";
import {CommandType} from "./help";

interface WarnArgs {
    readonly member: GuildMember;
    readonly reason: string;
    readonly evidence?: string;
}

export default class Warn extends Command {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "warn",
        description: "Warn an user"
    };

    readonly arguments: Array<CommandArgument> = [
        {
            name: "member",
            description: "The member to warn",
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

        this.restrict.environment = ChatEnvironment.Guild;
        this.restrict.specific = SpecificGroups.staff;
    }

    // TODO: Throws unknown message
    public async executed(context: CommandContext, args: WarnArgs, api: WardenAPI): Promise<void> { // TODO: api type not working for some reason
        if (context.sender.id === args.member.id) {
            context.fail("You can't warn yourself");

            return;
        }
        else if (args.member.user.bot) {
            context.fail("You can't warn a bot");

            return;
        }

        await api.warn({
            moderator: context.sender,
            reason: args.reason,
            user: args.member,
            evidence: args.evidence,
            message: context.message
        });
    }
};
