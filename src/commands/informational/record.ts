import {Command, CommandContext, Patterns, IArgument, InternalArgType, ChatEnvironment} from "@cloudrex/forge";
import {GuildMember, Message, RichEmbed} from "discord.js";
import {CommandType} from "../general/help";
import Mongo, {DatabaseMessage} from "../../database/mongo-database";

const max: number = 1000;

type RecordArgs = {
    readonly member: GuildMember;
};

export default class RecordCommand extends Command<RecordArgs> {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "record",
        description: "View your recorded information"
    };

    readonly arguments: IArgument[] = [
        {
            name: "member",
            description: "The user to inspect",
            type: InternalArgType.Member,
            required: false,
            defaultValue: (message: Message) => message.member.id
        }
    ];

    readonly restrict: any = {
        cooldown: 120,
        environment: ChatEnvironment.Guild
    };

    // TODO: Only retrieves FIRST 100 messages instead of LAST 100 messages
    public async executed(context: CommandContext, args: RecordArgs): Promise<void> {
        const messages: DatabaseMessage[] = await Mongo.collections.messages.find({
            authorId: args.member.id
        }).limit(max + 1).toArray();

        if (messages.length === 0) {
            await context.fail(`No data on record for <@${args.member.id}>`);

            return;
        }

        let mentions: number = 0;
        let words: number = 0;
        let characters: number = 0;
        let throttled: boolean = false;

        for (let i = 0; i < messages.length; i++) {
            // Limit loop to the specified max
            if (i >= max) {
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
            .addField("Messages Logged", messages.length > max ? `${max}+` : messages.length)
            .addField("Total Mentions", mentions === 0 ? "*None*" : (throttled ? `${max}+` : mentions))
            .addField("First Message Intercepted", messages[0].message.length > 50 ? messages[0].message.substr(0, 46) + " ..." : messages[0].message)
            .addField("Words Written", `${words} (${characters} characters)`);

        await context.message.channel.send(embed);
    }
};
