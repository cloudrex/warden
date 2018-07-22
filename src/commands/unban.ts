import {GuildMember} from "discord.js";
import { Command, Permission, CommandContext } from "discord-anvil";
import SpecificGroups from "../specific-groups";

export default class Unban extends Command {
    readonly meta = {
        name: "unban",
        description: "Unban a user"
    };

    readonly args = {
        user: "!:user",
        reason: "!string"
    };

    constructor() {
        super();

        this.restrict.selfPermissions = [Permission.BanMembers];
        this.restrict.specific = SpecificGroups.owner;
    }

    public async executed(context: CommandContext): Promise<void> {
        const member: GuildMember = context.arguments[0];

        if (member.id === context.sender.id) {
            context.fail("You can't unban yourself.");

            return;
        }

        await context.message.guild.unban(context.arguments[0].id);
    }
};
