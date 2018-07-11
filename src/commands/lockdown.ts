import {Role} from "discord.js";
import {CommandOptions} from "discord-anvil/dist";
import Permission from "discord-anvil/dist/core/permission";
import CommandContext from "discord-anvil/dist/commands/command-context";

export default <CommandOptions>{
    meta: {
        name: "lockdown",
        desc: "Lockdown the guild"
    },

    restrict: {
        specific: [
            "@285578743324606482" // Owner
        ],

        selfPerms: [Permission.ManageRoles]
    },

    executed: async (context: CommandContext): Promise<void> => {
        const everyone: Role = context.message.guild.roles.find("name", "@everyone");

        await everyone.setPermissions([
            "VIEW_CHANNEL",
            "READ_MESSAGES",
            "READ_MESSAGE_HISTORY"
        ]);

        await context.ok(":lock: Guild is now under lockdown.");
    }
};
