import {GuildMember, Message, RichEmbed, Snowflake} from "discord.js";
import WardenAPI from "../../core/warden-api";
import {Command, CommandContext, IArgument, InternalArgType, Permission, TrivialArgType, ChatEnvironment} from "@cloudrex/forge";
import {CommandType} from "../general/help";

export interface BanIdArgs {
    readonly id: Snowflake;
    readonly reason: string;
    readonly evidence?: string;
}

export default class BanIdCommand extends Command<BanIdArgs> {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "banid",
        description: "Ban a member by Id"
    };

    readonly arguments: IArgument[] = [
        {
            name: "id",
            description: "The member Id to ban",
            switchShortName: "i",
            type: InternalArgType.Snowflake,
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

    readonly restrict: any = {
        issuerPermissions: [Permission.BanMembers],
        selfPermissions: [Permission.BanMembers],
        environment: ChatEnvironment.Guild
    };

    public async executed(x: CommandContext, args: BanIdArgs, api: WardenAPI): Promise<void> {
        if (args.id === x.sender.id) {
            await x.fail("You can't ban yourself silly");

            return;
        }

        const member: GuildMember | null = x.msg.guild.member(args.id);

        if (member && member !== null && member !== undefined && !member.bannable) {
            await x.fail("Unable to ban that person.");

            return;
        }

        // TODO: Structure doesn't accept ID only, only accepts member obj
        /* await api.executeAction(x.channel, {
            member: args.id
        });*/
    }
};
