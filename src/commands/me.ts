import {Command, CommandContext, Permission, Utils} from "discord-anvil";
import {Channel, GuildChannel, RichEmbed, TextChannel} from "discord.js";
import {CommandType} from "./help";
import Mongo, {ChannelType, DatabaseChannel, DatabaseMessage} from "../database/mongo-database";

export default class Me extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "me",
        description: "View your recorded information"
    };

    constructor() {
        super();

        this.restrict.cooldown = 120;
    }

    public async executed(context: CommandContext): Promise<void> {
        const messages: Array<DatabaseMessage> = await Mongo.collections.messages.find({
            authorId: context.sender.id
        }).toArray();

        let throttle = 0;

        for (let i = 0; i < messages.length; i++) {
            if (messages[i].message)
        }

        const embed: RichEmbed = new RichEmbed().setColor("GREEN").addField("Messages Logged", `${messages.length} ()`);

        context.message.channel.send();
    }
};
