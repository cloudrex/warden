import {Command, CommandContext, Permission, Utils, ChatEnvironment} from "discord-anvil";
import {CommandType} from "../general/help";
import {table, TableUserConfig} from "table";
import {Permissions, PermissionResolvable} from "discord.js";

const tableConfig: TableUserConfig = {
    columns: {
        1: {
            alignment: "center"
        }
    }
};

export default class PermissionsCommand extends Command {
    readonly type = CommandType.Informational;

    readonly meta = {
        name: "permissions",
        description: "View your permissions"
    };

    readonly aliases = ["perms"];

    readonly restrict: any = {
        cooldown: 6
    };

    constructor() {
        super();

        /* this.restrict.cooldown = 5;
        this.restrict.environment = ChatEnvironment.Guild; */
    }

    private hasPermission(name: PermissionResolvable, permissions: Permissions): string {
        return permissions.hasPermission(name) ? "Yes" : "";
    }

    public async executed(context: CommandContext): Promise<void> {
        const perms: Permissions = context.message.member.permissions;

        const data: Array<Array<string>> = [
            ["Permission", "Yes/No"],
            ["Administrator", this.hasPermission("ADMINISTRATOR", perms)],
            ["View Audit Log", this.hasPermission("VIEW_AUDIT_LOG", perms)],
            ["Manage Server", this.hasPermission("MANAGE_GUILD", perms)],
            ["Manage Roles", this.hasPermission("MANAGE_ROLES", perms)],
            ["Manage Channels", this.hasPermission("MANAGE_CHANNELS", perms)],
            ["Kick Members", this.hasPermission("KICK_MEMBERS", perms)],
            ["Ban Members", this.hasPermission("BAN_MEMBERS", perms)],
            ["Create Invite", this.hasPermission("CREATE_INSTANT_INVITE", perms)],
            ["Manage Nicknames", this.hasPermission("MANAGE_NICKNAMES", perms)],
            ["Manage Emojis", this.hasPermission("MANAGE_EMOJIS", perms)],
            ["Send Messages", this.hasPermission("SEND_MESSAGES", perms)],
            ["Manage Messages", this.hasPermission("MANAGE_MESSAGES", perms)],
            ["Embed Links", this.hasPermission("EMBED_LINKS", perms)],
            ["Attach Files", this.hasPermission("ATTACH_FILES", perms)],
            ["Mention Everyone", this.hasPermission("MENTION_EVERYONE", perms)],

            // TODO: Add missing permissions
        ];

        await context.message.channel.send(`\`\`\`scala\n${table(data, tableConfig)}\`\`\``);
    }
};
