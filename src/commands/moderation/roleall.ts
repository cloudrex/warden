import {ChatEnvironment, Command, Permission} from "forge";
import {CommandType} from "../general/help";
import CommandContext from "forge/dist/commands/command-context";

export default class RoleAllCommand extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "roleall",
        description: "Add a role to all members"
    };

    readonly args = {
        role: "!string"
    };

    readonly restrict: any = {
        issuerPermissions: [Permission.ManageGuild, Permission.ManageRoles],
        selfPermissions: [Permission.ManageRoles],
        cooldown: 60,
        environment: ChatEnvironment.Guild
    };

    public executed(context: CommandContext): void {
        // const role: Role = context.arguments[0];

        // TODO

        /* const members: GuildMember[] = context.message.guild.members.array();

        for (let i: number = 0; i < members.length; i++) {
            members[i].addRole()
        } */
    }
};
