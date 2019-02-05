import {CommandType} from "../general/help";
import {Permissions, PermissionResolvable, Message, GuildMember, Snowflake} from "discord.js";
import {Command, Name, Description, Aliases, Constraints, ChatEnv, Arguments, Context, IAction, IMessageActionArgs, ActionType, MsgBuilder, Type} from "d.mix";

type ILocalArgs = {
    readonly member: GuildMember;
}

@Name("permissions")
@Description("View your permissions")
@Aliases("perms")
@Constraints({
    environment: ChatEnv.Guild,
    cooldown: 6
})
@Arguments(
    {
        name: "member",
        switchShortName: "m",
        type: Type.Member,
        description: "The member to inspect",
        required: false,
        defaultValue: (message: Message): Snowflake => message.author.id
    }
)
export default class extends Command<ILocalArgs> {
    readonly type = CommandType.Informational;

    private hasPermission(name: PermissionResolvable, permissions: Permissions): boolean {
        return permissions.hasPermission(name);
    }

    public async run($: Context, args: ILocalArgs): Promise<IAction<IMessageActionArgs>> {
        const perms: Permissions = args.member.permissions;

        let message: string = `Permissions of ${args.member.user.tag}\n\n`;

        // TODO: Use a loop instead
        message += `${this.hasPermission("ADMINISTRATOR", perms) ? "+" : "-"} Administrator\n`;
        message += `${this.hasPermission("VIEW_AUDIT_LOG", perms) ? "+" : "-"} View Audit Log\n`;
        message += `${this.hasPermission("MANAGE_GUILD", perms) ? "+" : "-"} Manage Server\n`;
        message += `${this.hasPermission("MANAGE_ROLES", perms) ? "+" : "-"} Manage Roles\n`;
        message += `${this.hasPermission("MANAGE_CHANNELS", perms) ? "+" : "-"} Manage Channels\n`;
        message += `${this.hasPermission("KICK_MEMBERS", perms) ? "+" : "-"} Kick Members\n`;
        message += `${this.hasPermission("BAN_MEMBERS", perms) ? "+" : "-"} Ban Members\n`;
        message += `${this.hasPermission("CREATE_INSTANT_INVITE", perms) ? "+" : "-"} Create Invite\n`;
        message += `${this.hasPermission("MANAGE_NICKNAMES", perms) ? "+" : "-"} Manage Nicknames\n`;
        message += `${this.hasPermission("MANAGE_EMOJIS", perms) ? "+" : "-"} Manage Emojis\n`;
        message += `${this.hasPermission("SEND_MESSAGES", perms) ? "+" : "-"} Send Messages\n`;
        message += `${this.hasPermission("MANAGE_MESSAGES", perms) ? "+" : "-"} Manage Messages\n`;
        message += `${this.hasPermission("EMBED_LINKS", perms) ? "+" : "-"} Embed Links\n`;
        message += `${this.hasPermission("ATTACH_FILES", perms) ? "+" : "-"} Attach Files\n`;
        message += `${this.hasPermission("MENTION_EVERYONE", perms) ? "+" : "-"} Mention Everyone\n`;

        return {
            type: ActionType.Message,

            args: {
                channelId: $.msg.channel.id,
                message: new MsgBuilder().codeBlock(message, "diff").build()
            }
        };
    }
};
