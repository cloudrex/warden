import {IMessageActionArgs, FormattedMessage, IAction, ActionType, Command, CommandContext, ChatEnvironment, InternalArgType, IArgument} from "@cloudrex/forge";
import {CommandType} from "../general/help";
import {Permissions, PermissionResolvable, Message, GuildMember, Snowflake} from "discord.js";

type PermissionsArgs = {
    readonly member: GuildMember;
}

export default class PermissionsCommand extends Command<PermissionsArgs> {
    readonly type = CommandType.Informational;

    readonly meta = {
        name: "permissions",
        description: "View your permissions"
    };

    readonly aliases = ["perms"];

    readonly restrict: any = {
        cooldown: 6,
        environment: ChatEnvironment.Guild
    };

    readonly arguments: IArgument[] = [
        {
            name: "member",
            switchShortName: "m",
            type: InternalArgType.Member,
            description: "The member to inspect",
            required: false,
            defaultValue: (message: Message): Snowflake => message.author.id
        }
    ];

    private hasPermission(name: PermissionResolvable, permissions: Permissions): boolean {
        return permissions.hasPermission(name);
    }

    public async executed(x: CommandContext, args: PermissionsArgs): Promise<IAction<IMessageActionArgs>> {
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
                channelId: x.msg.channel.id,
                message: new FormattedMessage().codeBlock(message, "diff").build()
            }
        };
    }
};
