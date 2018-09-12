import {Message, RichEmbed} from "discord.js";
import {WardenAPI} from "../core/warden-api";
import {ChatEnvironment, Command, CommandContext, Utils} from "discord-anvil";
import SpecificGroups from "../specific-groups";
import {CommandType} from "./help";

export default class Snipe extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "snipe",
        description: "View the last deleted message in this channel"
    };

    constructor() {
        super();

        this.restrict.environment = ChatEnvironment.Guild;
        this.restrict.specific = SpecificGroups.staff;
    }

    public async executed(context: CommandContext, args: Array<string>, api: WardenAPI): Promise<void> {
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
