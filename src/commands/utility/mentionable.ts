import {Role} from "discord.js";
import {Argument, ChatEnvironment, Command, Permission} from "discord-anvil";
import {CommandType} from "../general/help";
import {RestrictGroup} from "discord-anvil/dist/commands/command";
import CommandContext from "discord-anvil/dist/commands/command-context";

export interface MentionableArgs {
    readonly role: Role;
}

export default class Mentionable extends Command {
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
