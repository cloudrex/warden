import {GuildMember, Role} from "discord.js";
import {Argument, ChatEnvironment, Command, Permission} from "discord-anvil";
import {CommandType} from "../general/help";
import CommandContext from "discord-anvil/dist/commands/command-context";

type RoleArgs = {
    readonly role: Role;
    readonly member: GuildMember;
}

export default class RoleCommand extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "role",
        description: "Manage member roles"
    };

    readonly arguments: Array<Argument> = [
        {
            name: "role",
            description: "The role to add or remove",
            type: "role",
            required: true
        },
        {
            name: "member",
            description: "The member to add or remove the role from",
            type: "member",
            required: true
        }
    ];

    constructor() {
        super();

        this.restrict.environment = ChatEnvironment.Guild;
        this.restrict.issuerPermissions = [Permission.ManageRoles, Permission.ManageGuild];
    }

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
