import {Role} from "discord.js";
import {Command, Permission, RestrictGroup, CommandContext} from "@cloudrex/forge";
import {CommandType} from "../general/help";

export default class UnlockCommand extends Command {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "unlock",
        description: "Unlock the guild from lockdown"
    };

    readonly restrict: any = {
        specific: [RestrictGroup.ServerModerator],
        selfPermissions: [Permission.ManageRoles]
    };

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
