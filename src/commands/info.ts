import {Command, CommandContext, Permission, Utils} from "discord-anvil";
import {CommandType} from "./help";

export default class Info extends Command {
    readonly type = CommandType.Informational;

    readonly meta = {
        name: "info",
        description: "View information about the server"
    };

    readonly aliases = ["uptime"];

    constructor() {
        super();

        this.restrict.issuerPermissions = [Permission.ManageGuild];
    }

    public executed(context: CommandContext): void {
        context.sections({
            Uptime: Utils.timeAgoFromNow(context.bot.client.uptime),
            Members: context.message.guild.memberCount
        });
    }
};
