import {Role} from "discord.js";
import { Command, Permission, CommandContext } from "discord-anvil";

export default abstract class Mentionable extends Command {
    readonly meta = {
        name: "mentionable",
        description: "Toggle a role mentionable"
    };

    readonly args = {
        role: "!string"
    };

    readonly restrict = {
        specific: [
            "@285578743324606482" // Owner
        ],

        selfPerms: [Permission.ManageRoles]
    };

    // TODO: Add support by id
    async executed(context: CommandContext): Promise<void> {
        const role: Role | undefined = context.message.guild.roles.find("name", context.arguments[0]);

        if (!role) {
            await context.fail("Role not found.");

            return;
        }

        await role.setMentionable(!role.mentionable);

        if (role.mentionable) {
            await context.ok(`Role <@${role.id}> is now mentionable.`);
        }
        else {
            await context.ok(`Role <@${role.id}> is no longer mentionable.`);
        }
    }
};
