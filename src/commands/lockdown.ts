import {Role} from "discord.js";
import { Command, Permission, CommandContext } from "discord-anvil";

export default abstract class Lockdown extends Command {
    readonly meta = {
        name: "lockdown",
        description: "Lockdown the guild"
    };

    readonly restrict = {
        specific: [
            "@285578743324606482" // Owner
        ],

        selfPerms: [Permission.ManageRoles]
    };

    async executed(context: CommandContext): Promise<void> {
        const everyone: Role = context.message.guild.roles.find("name", "@everyone");

        await everyone.setPermissions([
            "VIEW_CHANNEL",
            "READ_MESSAGES",
            "READ_MESSAGE_HISTORY"
        ]);

        await context.ok(":lock: Guild is now under lockdown.");
    }
};
