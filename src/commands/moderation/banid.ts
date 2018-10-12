import {GuildMember, RichEmbed, Snowflake, TextBasedChannel, Message} from "discord.js";
import WardenAPI from "../../core/warden-api";
import {Command, Argument, CommandContext, Permission, Log} from "forge";
import {PrimitiveArgType} from "forge/dist/commands/command";
import {CommandType} from "../general/help";
import {ModerationActionType, ModerationAction} from "../../database/mongo-database";

export interface BanIdArgs {
    readonly id: Snowflake;
    readonly reason: string;
    readonly evidence?: string;
}

export default class BanCommand extends Command {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "banid",
        description: "Ban a member by Id"
    };

    readonly arguments: Array<Argument> = [
        {
            name: "id",
            description: "The member Id to ban",
            type: PrimitiveArgType.String,
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

    public async executed(context: CommandContext, args: BanIdArgs, api: WardenAPI): Promise<void> {
        if (args.id === context.sender.id) {
            await context.fail("You can't ban yourself.");
            
            return;
        }

        const member: GuildMember | null = context.message.guild.member(args.id);

        if (member && member !== null && member !== undefined && !member.bannable) {
            await context.fail("Unable to ban that person.");

            return;
        }

        await context.message.guild.ban(args.id);

        const embed: RichEmbed = new RichEmbed()
            .setTitle("User Id Banned")
            .addField("User Id", args.id)
            .addField("Reason", args.reason)
            .addField("Moderator", `<@${context.sender.id}> (${context.sender.tag})`)
            .setThumbnail(args.evidence ? args.evidence : "")
            .setFooter(`Banned by ${context.sender.username}`, context.sender.avatarURL)
            .setColor("RED");
        
        if (embed === null || embed.footer === undefined || embed.footer.text === undefined) {
            Log.error("[WardenAPI.executeAction] Expecting log message, embed footer and channels");

            return;
        }

        const sent: Message = await api.getChannels().modLog.send(embed) as Message;

        await sent.edit(embed.setFooter(`Case ID: ${sent.id} • ${embed.footer.text}`, embed.footer.icon_url));

        // TODO
        // await WardenAPI.saveModerationAction(action, sent.id);
    }
};
