import {Message, RichEmbed} from "discord.js";
import WardenAPI from "../../core/warden-api";
import {ChatEnvironment, Command, Utils, CommandContext, RestrictGroup} from "@cloudrex/forge";
import {CommandType} from "../general/help";

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

    public async executed(x: CommandContext, args: string[], api: WardenAPI): Promise<void> {
        const lastDeletedChannelMessage: Message | null = api.deletedMessages.get(x.msg.channel.id) || null;

        if (lastDeletedChannelMessage !== null) {
            const embed: boolean = lastDeletedChannelMessage.content.length === 0 && lastDeletedChannelMessage.embeds.length > 0;

            await x.msg.channel.send(new RichEmbed()
                .addField("Message", embed ? "*Embedded Message*" : lastDeletedChannelMessage.content)
                .addField("Author", `<@${lastDeletedChannelMessage.author.id}> (${lastDeletedChannelMessage.author.tag})`)
                .addField("Time", Utils.timeAgo(lastDeletedChannelMessage.createdTimestamp))
                .addField("Message ID", lastDeletedChannelMessage.id)
                .setColor("GREEN"));
        }
        else {
            await x.fail("No message has been deleted in this channel within the last 30 minutes.");
        }
    }
};
