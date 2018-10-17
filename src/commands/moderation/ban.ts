import {GuildMember, TextChannel} from "discord.js";
import WardenAPI from "../../core/warden-api";
import {Command, Argument, CommandContext, Permission, PrimitiveArgType} from "@cloudrex/forge";
import {CommandType} from "../general/help";
import {ModerationActionType} from "../../database/mongo-database";

export interface BanArgs {
    readonly member: GuildMember;
    readonly reason: string;
    readonly evidence?: string;
}

export default class BanCommand extends Command {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "ban",
        description: "Ban a member"
    };

    readonly arguments: Argument[] = [
        {
            name: "member",
            description: "The member to ban",
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
            description: "Evidence for the reason",
            type: PrimitiveArgType.String,
            required: false
        }
    ];

    readonly restrict: any = {
        issuerPermissions: [Permission.BanMembers],
        selfPermissions: [Permission.BanMembers]
    };

    public async executed(context: CommandContext, args: BanArgs, api: WardenAPI): Promise<void> {
        if (args.member.id === context.sender.id) {
            await context.fail("You can't ban yourself.");
            
            return;
        }
        else if (!args.member.bannable) {
            await context.fail("Unable to ban that person.");

            return;
        }

        await api.executeAction(context.message.channel as TextChannel, {
            type: ModerationActionType.Ban,
            reason: args.reason,
            member: args.member,
            evidence: args.evidence,
            moderator: context.message.member
        });
    }
};
