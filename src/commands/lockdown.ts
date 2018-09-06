import {Role} from "discord.js";
import {Command, CommandContext, Permission} from "discord-anvil";
import SpecificGroups from "../specific-groups";

export default class Lockdown extends Command {
    readonly meta = {
        name: "lockdown",
        description: "Lockdown the guild"
    };

    constructor() {
        super();

        this.restrict.specific = SpecificGroups.owner;
        this.restrict.selfPermissions = [Permission.ManageRoles];
    }

    public async executed(context: CommandContext): Promise<void> {
        const everyone: Role = context.message.guild.roles.find("name", "@everyone");

        await everyone.setPermissions([
            "VIEW_CHANNEL",
            "READ_MESSAGES",
            "READ_MESSAGE_HISTORY"
        ]);

        await context.ok(":lock: Guild is now under lockdown.");
    }
};
