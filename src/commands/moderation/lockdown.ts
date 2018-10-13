import {Role} from "discord.js";
import {Command, CommandContext, Permission, RestrictGroup} from "forge";
import {CommandType} from "../general/help";

export default class LockdownCommand extends Command {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "lockdown",
        description: "Lockdown the guild"
    };

    readonly restrict: any = {
        specific: [RestrictGroup.ServerModerator],
        selfPermissions: [Permission.ManageRoles, Permission.Admin]
    };

    public async executed(context: CommandContext): Promise<void> {
        const everyone: Role = context.message.guild.roles.find("name", "@everyone");

        await everyone.setPermissions([
            "VIEW_CHANNEL",
            "READ_MESSAGES",
            "READ_MESSAGE_HISTORY"
        ]);

        await context.ok(":lock: Guild is now under lockdown.");
    }
};
