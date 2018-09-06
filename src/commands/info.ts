import {Command, CommandContext, Permission, Utils} from "discord-anvil";

export default class Info extends Command {
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
