import {GuildMember, Role} from "discord.js";
import {IArgument, ChatEnvironment, Command, Permission, CommandContext, InternalArgType} from "@cloudrex/forge";
import {CommandType} from "../general/help";

type RoleArgs = {
    readonly role: Role;
    readonly member: GuildMember;
}

export default class RoleCommand extends Command<RoleArgs> {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "role",
        description: "Manage member roles"
    };

    readonly arguments: IArgument[] = [
        {
            name: "role",
            description: "The role to add or remove",
            type: InternalArgType.Role,
            required: true
        },
        {
            name: "member",
            description: "The member to add or remove the role from",
            type: InternalArgType.Member,
            required: true
        }
    ];

    readonly restrict: any = {
        issuerPermissions: [Permission.ManageRoles, Permission.ManageGuild],
        environment: ChatEnvironment.Guild
    };

    public async executed(context: CommandContext, args: RoleArgs): Promise<void> {
        // TODO: Async await
        if (!args.member.roles.exists("name", args.role.name)) {
            args.member.addRole(args.role).catch((error: Error) => {
                context.fail(`Operation failed. (${error.message})`);
            }).then(() => {
                context.ok(`Role <@&${args.role.id}> was successfully **added** to <@${args.member.id}>.`);
            });
        }
        else {
            args.member.removeRole(args.role).catch((error: Error) => {
                context.fail(`Operation failed. (${error.message})`);
            }).then(() => {
                context.ok(`Role <@&${args.role.id}> was successfully **removed** from <@${args.member.id}>.`);
            });
        }

    }
};
