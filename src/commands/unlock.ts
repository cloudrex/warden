import {Role} from "discord.js";
import {CommandOptions} from "discord-anvil/dist";
import Permission from "discord-anvil/dist/core/permission";
import CommandContext from "discord-anvil/dist/commands/command-context";

export default <CommandOptions>{
    meta: {
        name: "unlock",
        desc: "Unlock the guild from lockdown"
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
            "CREATE_INSTANT_INVITE",
            "SEND_MESSAGES",
            "READ_MESSAGE_HISTORY",
            "USE_EXTERNAL_EMOJIS",
            "ADD_REACTIONS",
            "CONNECT",
            "SPEAK",
            "USE_VAD",
            "READ_MESSAGES"
        ]);

        await context.ok(":unlock: Guild is no longer under lockdown.");
    }
};
