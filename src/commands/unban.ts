import {GuildMember} from "discord.js";
import { Command, Permission, CommandContext } from "discord-anvil";

export default class Unban extends Command {
    readonly meta = {
        name: "unban",
        description: "Unban a user"
    };

    readonly args = {
        user: "!:user",
        reason: "!string"
    };

    readonly restrict = {
        issuerPerms: [Permission.BanMembers],
        selfPerms: [Permission.BanMembers]
    };

    public async executed(context: CommandContext): Promise<void> {
        const member: GuildMember = context.arguments[0];

        if (member.id === context.sender.id) {
            context.fail("You can't unban yourself.");

            return;
        }

        await context.message.guild.unban(context.arguments[0].id);
    }
};
