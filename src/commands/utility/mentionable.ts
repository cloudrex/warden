import {Role} from "discord.js";
import {IArgument, ChatEnvironment, Command, Permission, RestrictGroup, CommandContext, InternalArgType} from "@cloudrex/forge";
import {CommandType} from "../general/help";

type MentionableArgs = {
    readonly role: Role;
}

export default class MentionableCommand extends Command<MentionableArgs> {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "mentionable",
        description: "Toggle a role mentionable"
    };

    readonly arguments: IArgument[] = [
        {
            name: "role",
            description: "The role to toggle mentionable",
            switchShortName: "r",
            type: InternalArgType.Role,
            required: true
        }
    ];

    readonly restrict: any = {
        environment: ChatEnvironment.Guild,
        specific: [RestrictGroup.ServerOwner],
        selfPermissions: [Permission.ManageRoles]
    };

    // TODO: Add support by id
    public async executed(x: CommandContext, args: MentionableArgs): Promise<void> {
        await args.role.setMentionable(!args.role.mentionable);

        if (args.role.mentionable) {
            await x.ok(`Role <@${args.role.id}> is now mentionable.`);
        }
        else {
            await x.ok(`Role <@${args.role.id}> is no longer mentionable.`);
        }
    }
};
