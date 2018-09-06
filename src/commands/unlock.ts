import {Role} from "discord.js";
import {Command, CommandContext, Permission} from "discord-anvil";
import SpecificGroups from "../specific-groups";

export default class Unlock extends Command {
    readonly meta = {
        name: "unlock",
        description: "Unlock the guild from lockdown"
    };

    constructor() {
        super();

        this.restrict.specific = SpecificGroups.owner;
        this.restrict.selfPermissions = [Permission.ManageRoles];
    }

    public async executed(context: CommandContext): Promise<void> {
        const everyone: Role = context.message.guild.roles.find("name", "@everyone");

        await everyone.setPermissions([
            "CREATE_INSTANT_INVITE",
            "SEND_MESSAGES",
            "READ_MESSAGE_HISTORY",
            "USE_EXTERNAL_EMOJIS",
            "ADD_REACTIONS",
            "CONNECT",
            "SPEAK",
            "USE_VAD",
            "READ_MESSAGES"
        ]);

        await context.ok(":unlock: Guild is no longer under lockdown.");
    }
};
