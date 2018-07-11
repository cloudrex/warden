import {CommandOptions} from "discord-anvil/dist";
import Permission from "discord-anvil/dist/core/permission";
import CommandContext from "discord-anvil/dist/commands/command-context";
import Utils from "discord-anvil/dist/core/utils";

export default <CommandOptions>{
    meta: {
        name: "info",
        desc: "View information about the server",
        aliases: ["uptime"]
    },

    restrict: {
        issuerPerms: [Permission.ManageGuild]
    },

    executed: (context: CommandContext): void => {
        context.sections({
            Uptime: Utils.timeAgoFromNow(context.bot.client.uptime),
            Members: context.message.guild.memberCount
        });
    }
};
