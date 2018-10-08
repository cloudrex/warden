import {Message, RichEmbed} from "discord.js";
import WardenAPI from "../../core/warden-api";
import {ChatEnvironment, Command, Utils} from "forge";
import {CommandType} from "../general/help";
import {RestrictGroup} from "forge/dist/commands/command";
import CommandContext from "forge/dist/commands/command-context";

export default class SnipeCommand extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "snipe",
        description: "View the last deleted message in this channel"
    };

    readonly restrict: any = {
        specific: [RestrictGroup.ServerModerator],
        environment: ChatEnvironment.Guild
    };

    public async executed(context: CommandContext, args: string[], api: WardenAPI): Promise<void> {
        const lastDeletedChannelMessage: Message | null = api.deletedMessages.get(context.message.channel.id) || null;

        if (lastDeletedChannelMessage) {
            const embed = lastDeletedChannelMessage.content.length === 0 && lastDeletedChannelMessage.embeds.length > 0;

            context.message.channel.send(new RichEmbed()
                .addField("Message", embed ? "*Embedded Message*" : lastDeletedChannelMessage.content)
                .addField("Author", `<@${lastDeletedChannelMessage.author.id}> (${lastDeletedChannelMessage.author.tag})`)
                .addField("Time", Utils.timeAgo(lastDeletedChannelMessage.createdTimestamp))
                .addField("Message ID", lastDeletedChannelMessage.id)
                .setColor("GREEN"));
        }
        else {
            await context.fail("No message has been deleted in this channel within the last 30 minutes.");
        }
    }
};
