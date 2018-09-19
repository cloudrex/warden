import {Role} from "discord.js";
import {ChatEnvironment, Command, Argument, CommandContext} from "discord-anvil";
import {RestrictGroup, PrimitiveArgType} from "discord-anvil/dist/commands/command";
import {CommandType} from "../general/help";

interface RolesArgs {
    readonly page: number;
}

export default class Roles extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "roles",
        description: "Display the server's roles",
    };

    readonly arguments: Array<Argument> = [
        {
            name: "page",
            type: PrimitiveArgType.UnsignedInteger,
            defaultValue: 0
        }
    ];

    constructor() {
        super();

        this.restrict.environment = ChatEnvironment.Guild;
        this.restrict.specific = [RestrictGroup.ServerModerator];
    }

    public executed(context: CommandContext, args: RolesArgs): void {
        context.ok(context.message.guild.roles.array()
            .map((role: Role) => `<@&${role.id}> => ${role.id}`)
            .join("\n")
            .substring(args.page * 2048)
            .substr(0, 2048));
    }
};
