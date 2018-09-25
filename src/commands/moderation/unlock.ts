import {Role} from "discord.js";
import {Command, Permission} from "discord-anvil";
import {CommandType} from "../general/help";
import {RestrictGroup} from "discord-anvil/dist/commands/command";
import CommandContext from "discord-anvil/dist/commands/command-context";

export default class UnlockCommand extends Command {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "unlock",
        description: "Unlock the guild from lockdown"
    };

    readonly restrict: any = {
        specific: [RestrictGroup.BotOwner],
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
