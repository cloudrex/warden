import {GuildMember, TextChannel, Message} from "discord.js";
import WardenAPI from "../../core/warden-api";
import {Command, IArgument, CommandContext, Permission, TrivialArgType, ChatEnvironment, InternalArgType} from "@cloudrex/forge";
import {CommandType} from "../general/help";
import {ModerationActionType} from "../../database/mongo-database";

export interface BanArgs {
    readonly member: GuildMember;
    readonly reason: string;
    readonly evidence?: string;
}

export default class BanCommand extends Command<BanArgs> {
    readonly type = CommandType.Moderation;

    readonly undoable: boolean = true;

    readonly meta = {
        name: "ban",
        description: "Ban a member"
    };

    readonly arguments: IArgument[] = [
        {
            name: "member",
            description: "The member to ban",
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
            description: "Evidence for the reason",
            switchShortName: "e",
            type: TrivialArgType.String,
            required: false
        }
    ];

    readonly aliases: string[] = ["banana", "beam", "poof", "bend", "bean"];

    readonly restrict: any = {
        issuerPermissions: [Permission.BanMembers],
        selfPermissions: [Permission.BanMembers],
        environment: ChatEnvironment.Guild
    };

    public async undo(oldContext: CommandContext, message: Message, args: BanArgs): Promise<boolean> {
        // TODO: Can't trust stored context to retrieve API
        await oldContext.bot.getAPI().executeAction(message.channel as TextChannel, {
            member: args.member,
            moderator: message.member,
            reason: "Automatic ⇒ Action undone",
            type: ModerationActionType.Unban
        });

        return true;
    }

    public async executed(context: CommandContext, args: BanArgs, api: WardenAPI): Promise<void> {
        if (args.member.id === context.sender.id) {
            await context.fail("You can't ban yourself silly.");

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
