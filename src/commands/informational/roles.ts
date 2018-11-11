import {Role} from "discord.js";
import {IPaginatedActionArgs, IAction, ActionType, ChatEnvironment, Command, IArgument, CommandContext, RestrictGroup, TrivialArgType} from "@cloudrex/forge";
import {CommandType} from "../general/help";

type RolesArgs = {
    readonly page: number;
}

export default class RolesCommand extends Command<RolesArgs> {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "roles",
        description: "Display the server's roles",
    };

    readonly arguments: IArgument[] = [
        {
            name: "page",
            switchShortName: "p",
            type: TrivialArgType.UnsignedInteger,
            defaultValue: 0
        }
    ];

    readonly restrict: any = {
        cooldown: 1,
        specific: [RestrictGroup.ServerModerator],
        environment: ChatEnvironment.Guild
    };

    public async executed(context: CommandContext, args: RolesArgs): Promise<IAction<IPaginatedActionArgs>> {
        return {
            type: ActionType.PaginatedOkEmbed,
            
            args: {
                bot: context.bot,
                context,
                inputMessage: context.message,

                message: context.message.guild.roles
                    .array()
                    .map((role: Role) => `<@&${role.id}> => ${role.id}`)
                    .join("\n")
                    .substring(args.page * 2048)
                    .substr(0, 2048)
            }
        };
    }
};
