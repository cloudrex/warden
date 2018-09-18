import {GuildMember} from "discord.js";
import WardenAPI from "../../core/warden-api";
import {Command, CommandArgument, CommandContext, Permission} from "discord-anvil";
import {PrimitiveArgumentType} from "discord-anvil/dist/commands/command";
import {CommandType} from "../general/help";
import {ModerationActionType} from "../../database/mongo-database";

export interface BanArgs {
    readonly member: GuildMember;
    readonly reason: string;
    readonly evidence?: string;
}

export default class Ban extends Command {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "ban",
        description: "Ban a member"
    };

    readonly arguments: Array<CommandArgument> = [
        {
            name: "member",
            description: "The member to ban",
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
            description: "Evidence for the reason",
            type: PrimitiveArgumentType.String,
            required: false
        }
    ];

    constructor() {
        super();

        this.restrict.issuerPermissions = [Permission.BanMembers];
        this.restrict.selfPermissions = [Permission.BanMembers];
    }

    public executed(context: CommandContext, args: BanArgs, api: WardenAPI): Promise<void> {
        return new Promise<void>(async (resolve) => {
            if (args.member.id === context.sender.id) {
                await context.fail("You can't ban yourself.");

                return;
            }
            else if (!args.member.bannable) {
                await context.fail("Unable to ban that person.");

                return;
            }

            await api.executeAction({
                type: ModerationActionType.Ban,
                reason: args.reason,
                member: args.member,
                evidence: args.evidence,
                moderator: context.message.member
            });
        });
    }
};
