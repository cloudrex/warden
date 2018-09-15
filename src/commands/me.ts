import {Command, CommandContext, Permission, Utils} from "discord-anvil";
import {RichEmbed} from "discord.js";
import {CommandType} from "./help";
import Mongo, {DatabaseMessage} from "../database/mongo-database";
import Patterns from "discord-anvil/dist/core/patterns";

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

    // TODO: Only retrieves FIRST 100 messages instead of LAST 100 messages
    public async executed(context: CommandContext): Promise<void> {
        const messages: Array<DatabaseMessage> = await Mongo.collections.messages.find({
            authorId: context.sender.id
        }).limit(101).toArray();

        let mentions: number = 0;
        let words: number = 0;
        let characters: number = 0;
        let throttled: boolean = false;

        for (let i = 0; i < messages.length; i++) {
            // Limit loop to 100
            if (i >= 100) {
                throttled = true;

                break;
            }

            words += messages[i].message.split(" ").length;
            characters += messages[i].message.split(" ").join("").length;

            if (Patterns.mention.test(messages[i].message)) {
                mentions++;
            }
        }

        const embed: RichEmbed = new RichEmbed().setColor("GREEN")
            .addField("Messages Logged", messages.length > 100 ? "100+" : messages.length)
            .addField("Total Mentions", mentions === 0 ? "*None*" : (throttled ? "100+" : mentions))
            .addField("First Message Intercepted", messages[0].message.length > 50 ? messages[0].message.substr(0, 46) + " ..." : messages[0].message)
            .addField("Words Written", `${words} (${characters} characters)`);

        context.message.channel.send(embed);
    }
};
