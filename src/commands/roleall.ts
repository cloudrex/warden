import {ChatEnvironment, Command, CommandContext, Permission} from "discord-anvil";
import {CommandType} from "./help";

export default class RoleAll extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "roleall",
        description: "Add a role to all members"
    };

    readonly args = {
        role: "!string"
    };

    constructor() {
        super();

        this.restrict.environment = ChatEnvironment.Guild;
        this.restrict.issuerPermissions = [Permission.ManageGuild];
        this.restrict.selfPermissions = [Permission.ManageRoles];
        this.restrict.cooldown = 60;
    }

    public executed(context: CommandContext): void {
        // const role: Role = context.arguments[0];

        // TODO

        /* const members: Array<GuildMember> = context.message.guild.members.array();

        for (let i: number = 0; i < members.length; i++) {
            members[i].addRole()
        } */
    }
};
