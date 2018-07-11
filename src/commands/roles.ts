import {CommandOptions} from "discord-anvil/dist";
import CommandContext from "discord-anvil/dist/commands/command-context";

export default <CommandOptions>{
    meta: {
        name: "roles",
        desc: "Display the server's roles",

        args: {
            page: "number"
        }
    },

    restrict: {
        specific: [
            "@285578743324606482", // Owner
            "&458130451572457483", // Trial mods
            "&458130847510429720", // Mods
            "&458812900661002260"  // Assistants
        ]
    },

    executed: (context: CommandContext): void => {
        context.ok(context.message.guild.roles.array()
            .map((role) => `<@&${role.id}> => ${role.id}`)
            .join("\n")
            .substring(context.arguments[0] ? parseInt(context.arguments[0]) * 2048 : 0)
            .substr(0, 2048));
    }
};
