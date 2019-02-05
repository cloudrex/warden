import {Role} from "discord.js";
import {IPaginatedActionArgs, IAction, ActionType, ChatEnvironment, Command, IArgument, CommandContext, RestrictGroup, TrivialArgType} from "@cloudrex/forge";
import {CommandType} from "../general/help";
import {Name, Description, Arguments, Constraints, ChatEnv} from "d.mix";

interface ILocalArgs {
    readonly page: number;
}

@Name("roles")
@Description("Display the server's roles")
@Arguments(
    {
        name: "page",
        switchShortName: "p",
        type: TrivialArgType.UnsignedInteger,
        defaultValue: 0
    }
)
@Constraints({
    environment: ChatEnv.Guild,
    specific: [RestrictGroup.ServerModerator],
    cooldown: 1
})
export default class RolesCommand extends Command<ILocalArgs> {
    readonly type = CommandType.Utility;

    public run(x: CommandContext, args: ILocalArgs): IAction<IPaginatedActionArgs> {
        return {
            type: ActionType.PaginatedOkEmbed,

            args: {
                bot: x.bot,
                context: x,
                inputMessage: x.msg,

                message: x.msg.guild.roles.array()
                    .map((role: Role) => `<@&${role.id}> => ${role.id}`)
                    .join("\n")
                    .substring(args.page * 2048)
                    .substr(0, 2048)
            }
        };
    }
};
