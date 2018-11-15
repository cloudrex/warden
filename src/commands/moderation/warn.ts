import {IArgument, ChatEnvironment, Command, TrivialArgType, RestrictGroup, CommandContext, InternalArgType} from "@cloudrex/forge";
import {GuildMember, TextChannel} from "discord.js";
import {CommandType} from "../general/help";
import {ModerationActionType} from "../../database/mongo-database";
import WardenAPI from "../../core/warden-api";

type WarnArgs = {
    readonly member: GuildMember;
    readonly reason: string;
    readonly evidence?: string;
}

export default class WarnCommand extends Command<WarnArgs> {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "warn",
        description: "Warn an user"
    };

    readonly arguments: IArgument[] = [
        {
            name: "member",
            description: "The member to warn",
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
            name: "evidence",
            description: "The evidence of the reason",
            switchShortName: "e",
            type: TrivialArgType.String,
            required: false
        }
    ];

    readonly restrict: any = {
        specific: [RestrictGroup.ServerModerator],
        environment: ChatEnvironment.Guild
    };

    // TODO: Throws unknown message
    public async executed(x: CommandContext, args: WarnArgs, api: WardenAPI): Promise<void> { // TODO: api type not working for some reason
        if (x.sender.id === args.member.id) {
            await x.fail("You can't warn yourself");

            return;
        }
        else if (args.member.user.bot) {
            await x.fail("You can't warn a bot");

            return;
        }

        await api.executeAction(x.msg.channel as TextChannel, {
            type: ModerationActionType.Warn,
            moderator: x.msg.member,
            reason: args.reason,
            member: args.member,
            evidence: args.evidence
        });
    }
};
