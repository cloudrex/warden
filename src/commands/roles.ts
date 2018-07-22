import { Role } from "discord.js";
import { Command, CommandContext } from "discord-anvil";

export default class Roles extends Command {
    readonly meta = {
        name: "roles",
        description: "Display the server's roles",
    };

    readonly args = {
        page: "number"
    };

    readonly restrict = {
        specific: [
            "@285578743324606482", // Owner
            "&458130451572457483", // Trial mods
            "&458130847510429720", // Mods
            "&458812900661002260"  // Assistants
        ]
    };

    public executed(context: CommandContext): void {
        context.ok(context.message.guild.roles.array()
            .map((role: Role) => `<@&${role.id}> => ${role.id}`)
            .join("\n")
            .substring(context.arguments[0] ? parseInt(context.arguments[0]) * 2048 : 0)
            .substr(0, 2048));
    }
};
