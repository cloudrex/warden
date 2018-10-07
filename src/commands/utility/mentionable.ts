import {Role} from "discord.js";
import {Argument, ChatEnvironment, Command, Permission} from "forge";
import {CommandType} from "../general/help";
import {RestrictGroup} from "forge/dist/commands/command";
import CommandContext from "forge/dist/commands/command-context";

type MentionableArgs = {
    readonly role: Role;
}

export default class MentionableCommand extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "mentionable",
        description: "Toggle a role mentionable"
    };

    readonly arguments: Array<Argument> = [
        {
            name: "role",
            description: "The role to toggle mentionable",
            type: "role",
            required: true
        }
    ];

    constructor() {
        super();

        this.restrict.environment = ChatEnvironment.Guild;
        this.restrict.specific = [RestrictGroup.ServerOwner];
        this.restrict.selfPermissions = [Permission.ManageRoles];
    }

    // TODO: Add support by id
    public async executed(context: CommandContext, args: MentionableArgs): Promise<void> {
        await args.role.setMentionable(!args.role.mentionable);

        if (args.role.mentionable) {
            await context.ok(`Role <@${args.role.id}> is now mentionable.`);
        }
        else {
            await context.ok(`Role <@${args.role.id}> is no longer mentionable.`);
        }
    }
};
