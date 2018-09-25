import {Argument, ChatEnvironment, Command, Utils} from "discord-anvil";
import {PrimitiveArgType, RestrictGroup} from "discord-anvil/dist/commands/command";
import {GuildMember} from "discord.js";
import {CommandType} from "../general/help";
import {ModerationActionType} from "../../database/mongo-database";
import WardenAPI from "../../core/warden-api";
import CommandContext from "discord-anvil/dist/commands/command-context";

type WarnArgs = {
    readonly member: GuildMember;
    readonly reason: string;
    readonly evidence?: string;
}

export default class WarnCommand extends Command {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "warn",
        description: "Warn an user"
    };

    readonly arguments: Array<Argument> = [
        {
            name: "member",
            description: "The member to warn",
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
            name: "evidence",
            description: "The evidence of the reason",
            type: PrimitiveArgType.String,
            required: false
        }
    ];

    readonly restrict: any = {
        specific: [RestrictGroup.ServerModerator],
        environment: ChatEnvironment.Guild
    };

    // TODO: Throws unknown message
    public async executed(context: CommandContext, args: WarnArgs, api: WardenAPI): Promise<void> { // TODO: api type not working for some reason
        if (context.sender.id === args.member.id) {
            await context.fail("You can't warn yourself");

            return;
        }
        else if (args.member.user.bot) {
            await context.fail("You can't warn a bot");

            return;
        }

        await api.executeAction({
            type: ModerationActionType.Warn,
            moderator: context.message.member,
            reason: args.reason,
            member: args.member,
            evidence: args.evidence
        });
    }
};