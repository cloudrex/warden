import {Role} from "discord.js";
import {CommandType} from "../general/help";
import {Name, Description, Arguments, Constraints, ChatEnv, Context, Command, RestrictGroup, Permission, Type} from "d.mix";

interface ILocalArgs {
    readonly role: Role;
}

@Name("mentionable")
@Description("Toggle a role mentionable")
@Arguments({
    name: "role",
    description: "The role to toggle mentionable",
    switchShortName: "r",
    type: Type.Role,
    required: true
})
@Constraints({
    environment: ChatEnv.Guild,
    specific: [RestrictGroup.ServerOwner],
    selfPermissions: [Permission.ManageRoles]
})
export default class extends Command {
    readonly type = CommandType.Utility;

    // TODO: Add support by id.
    public async executed($: Context, args: ILocalArgs) {
        await args.role.setMentionable(!args.role.mentionable);

        if (args.role.mentionable) {
            await $.ok(`Role <@${args.role.id}> is now mentionable.`);
        }
        else {
            await $.ok(`Role <@${args.role.id}> is no longer mentionable.`);
        }
    }
};
