import {Command, CommandContext, RestrictGroup, EmojiMenuV2} from "@cloudrex/forge";
import {Message, MessageReaction, User} from "discord.js";

export default class TestECommand extends Command {
    readonly meta = {
        name: "etest",
        description: "Test debugging stuff"
    };

    readonly restrict: any = {
        specific: [RestrictGroup.BotOwner]
    };

    public async executed(context: CommandContext): Promise<void> {
        const sent: Message = await context.message.channel.send("Hello world") as Message;

        const menu: EmojiMenuV2 = new EmojiMenuV2(sent.id, context.sender.id);

        menu.add({
            emoji: "500365648883351552",

            async clicked(reaction: MessageReaction, user: User): Promise<void> {
                await reaction.message.channel.send(`${user.username} clicked`);
            }
        }).attach(context);
    }
};
