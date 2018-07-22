import { Role } from "discord.js";
import { Command, CommandContext } from "discord-anvil";
import SpecificGroups from "../specific-groups";

export default class Roles extends Command {
    readonly meta = {
        name: "roles",
        description: "Display the server's roles",
    };

    readonly args = {
        page: "number"
    };

    constructor() {
        super();

        this.restrict.specific = SpecificGroups.staff;
    }

    public executed(context: CommandContext): void {
        context.ok(context.message.guild.roles.array()
            .map((role: Role) => `<@&${role.id}> => ${role.id}`)
            .join("\n")
            .substring(context.arguments[0] ? parseInt(context.arguments[0]) * 2048 : 0)
            .substr(0, 2048));
    }
};
