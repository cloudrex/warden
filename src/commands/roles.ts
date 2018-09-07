import {Role} from "discord.js";
import {ChatEnvironment, Command, CommandArgument, CommandContext} from "discord-anvil";
import SpecificGroups from "../specific-groups";
import {PrimitiveArgumentType} from "discord-anvil/dist/commands/command";
import {CommandType} from "./help";

interface RolesArgs {
    readonly page: number;
}

export default class Roles extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "roles",
        description: "Display the server's roles",
    };

    readonly arguments: Array<CommandArgument> = [
        {
            name: "page",
            type: PrimitiveArgumentType.UnsignedInteger,
            defaultValue: 0
        }
    ];

    constructor() {
        super();

        this.restrict.environment = ChatEnvironment.Guild;
        this.restrict.specific = SpecificGroups.staff;
    }

    public executed(context: CommandContext, args: RolesArgs): void {
        context.ok(context.message.guild.roles.array()
            .map((role: Role) => `<@&${role.id}> => ${role.id}`)
            .join("\n")
            .substring(args.page * 2048)
            .substr(0, 2048));
    }
};
