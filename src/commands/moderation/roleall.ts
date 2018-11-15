import {ChatEnvironment, Command, Permission, CommandContext} from "@cloudrex/forge";
import {CommandType} from "../general/help";

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

    public executed(x: CommandContext): void {
        // const role: Role = context.arguments[0];

        // TODO

        /* const members: GuildMember[] = context.message.guild.members.array();

        for (let i: number = 0; i < members.length; i++) {
            members[i].addRole()
        } */
    }
};
