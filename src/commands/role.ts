import {GuildMember, Role} from "discord.js";
import { Command, Permission, CommandContext } from "discord-anvil";

export default class RoleCommand extends Command {
    readonly meta = {
        name: "role",
        description: "Manage member roles"
    };

    readonly args = {
        role: "!string",
        member: "!:member"
    };

    constructor() {
        super();

        this.restrict.issuerPermissions = [Permission.ManageRoles, Permission.ManageGuild];
    }

    public async executed(context: CommandContext): Promise<void> {
        if (!context.arguments[1]) {
            await context.fail("No member found");

            return;
        }

        let role: Role = context.message.guild.roles.find("name", context.arguments[0]);

        if (!role) {
            role = context.message.guild.roles.find("name", ((<string>context.arguments[0]).charAt(0).toUpperCase() + (<string>context.arguments[0]).slice(1)))

            if (!role) {
                await context.fail("Invalid role or does not exist.");

                return;
            }
        }

        const member = <GuildMember>context.arguments[1];

        // TODO: Async await
        if (!member.roles.exists("name", role.name)) {
            member.addRole(role).catch((error: Error) => {
                context.fail(`Operation failed. (${error.message})`);
            }).then(() => {
                context.ok(`Role <@&${role.id}> was successfully **added** to <@${member.id}>.`);
            });
        }
        else {
            member.removeRole(role).catch((error: Error) => {
                context.fail(`Operation failed. (${error.message})`);
            }).then(() => {
                context.ok(`Role <@&${role.id}> was successfully **removed** from <@${member.id}>.`);
            });
        }

    }
};
