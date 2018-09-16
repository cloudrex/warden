import {GuildMember} from "discord.js";
import {Command, CommandArgument, CommandContext, Permission} from "discord-anvil";
import SpecificGroups from "../specific-groups";
import {CommandRestrictGroup, PrimitiveArgumentType} from "discord-anvil/dist/commands/command";
import WardenAPI from "../core/warden-api";
import {CommandType} from "./help";

interface SoftbanArgs {
    readonly member: GuildMember;
    readonly reason: string;
    readonly evidence?: string;
}

export default class Softban extends Command {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "softban",
        description: "Softban a user"
    };

    readonly arguments: Array<CommandArgument> = [
        {
            name: "member",
            type: "member",
            description: "The member to softban",
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

        this.restrict.specific = [CommandRestrictGroup.BotOwner];
        this.restrict.selfPermissions = [Permission.BanMembers];
    }

    public executed(context: CommandContext, args: SoftbanArgs, api: WardenAPI): Promise<void> {
        return new Promise(async (resolve) => {
            if (args.member.id === context.sender.id) {
                context.fail("You can't ban yourself.");

                return;
            }
            else if (!args.member.bannable) {
                context.fail("Unable to ban that person.");

                return;
            }

            args.member.ban({
                days: 1,
                reason: args.reason
            }).then(async () => {
                // TODO: Does it actually await this?
                await api.reportCase({
                    moderator: context.sender,
                    color: "RED",
                    reason: args.reason,
                    evidence: args.evidence,
                    title: "Ban",
                    member: args.member
                });

                resolve();
            }).catch(async (error: Error) => {
                // TODO: Does it actually await this?
                await context.fail(`Operation failed. (${error.message})`);
            });

            await context.message.guild.unban(args.member.id, "Softban");
            resolve();
        });
    }
};
