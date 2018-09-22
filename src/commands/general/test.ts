import {Command, CommandContext} from "discord-anvil";
import {CommandType} from "./help";
import {TextChannel, Permissions} from "discord.js";
import {RestrictGroup} from "discord-anvil/dist/commands/command";

export default class Test extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "test",
        description: "Test whether I can send messages in this channel"
    };

    constructor() {
        super();

        this.restrict.specific = [RestrictGroup.ServerModerator];
    }

    public async executed(context: CommandContext): Promise<void> {
        // TODO: Check if the send message failed and display error, and check if embeds + files can be sent.
        if (context.message.channel.type === "text") {
            const channel: TextChannel = context.message.channel as TextChannel;
            const permissions: Permissions | null = await channel.permissionsFor(context.message.guild.me);

            let canEmbed: boolean = context.message.guild.me.hasPermission("EMBED_LINKS");

            if (permissions !== null) {
                canEmbed = permissions.hasPermission("EMBED_LINKS");
            }

            if (canEmbed) {
                await context.ok("I can send messages in this channel");
            }
            else {
                await channel.send("I'm missing the `EMBED_LINKS` permission required for embeds");
            }
        }
    }
};
