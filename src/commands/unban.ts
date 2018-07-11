import {GuildMember} from "discord.js";
import Permission from "discord-anvil/dist/core/permission";
import CommandContext from "discord-anvil/dist/commands/command-context";
import {CommandOptions} from "discord-anvil/dist";

export default <CommandOptions>{
    meta: {
        name: "unban",
        desc: "Unban a user",

        args: {
            user: "!:user",
            reason: "!string"
        },
    },

    restrict: {
        issuerPerms: [Permission.BanMembers],
        selfPerms: [Permission.BanMembers]
    },

    executed: async (context: CommandContext): Promise<void> => {
        const member: GuildMember = context.arguments[0];

        if (member.id === context.sender.id) {
            context.fail("You can't unban yourself.");

            return;
        }

        await context.message.guild.unban(context.arguments[0].id);
    }
};
