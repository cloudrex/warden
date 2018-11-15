import {Role, Message} from "discord.js";
import {Command, CommandContext, Permission, RestrictGroup, ChatEnvironment} from "@cloudrex/forge";
import {CommandType} from "../general/help";

export default class LockdownCommand extends Command {
    readonly type = CommandType.Moderation;

    readonly undoable: boolean = true;

    readonly meta = {
        name: "lockdown",
        description: "Lockdown the guild"
    };

    readonly restrict: any = {
        specific: [RestrictGroup.ServerModerator],
        environment: ChatEnvironment.Guild,
        selfPermissions: [Permission.ManageRoles, Permission.Admin]
    };

    public async undo(oldContext: CommandContext, message: Message): Promise<boolean> {
        // TODO: Can't trust oldContext
        await oldContext.bot.triggerCommand("unlock", message);

        return true;
    }

    public async executed(x: CommandContext): Promise<void> {
        const everyone: Role = x.msg.guild.roles.find("name", "@everyone");

        await everyone.setPermissions([
            "VIEW_CHANNEL",
            "READ_MESSAGES",
            "READ_MESSAGE_HISTORY"
        ]);

        await x.ok(":lock: Guild is now under lockdown.");
    }
};
