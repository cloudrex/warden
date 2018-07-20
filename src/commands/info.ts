import { Command, Permission, CommandContext, Utils } from "discord-anvil";

export default abstract class Info extends Command {
    readonly meta = {
        name: "info",
        description: "View information about the server"
    };

    readonly aliases = ["uptime"];

    readonly restrict = {
        issuerPerms: [Permission.ManageGuild]
    };

    executed(context: CommandContext): void {
        context.sections({
            Uptime: Utils.timeAgoFromNow(context.bot.client.uptime),
            Members: context.message.guild.memberCount
        });
    }
};
