import {Command, CommandContext, RestrictGroup, EmojiMenu} from "@cloudrex/forge";
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
        const menu: EmojiMenu = new EmojiMenu(sent.id, context.sender.id);

        menu.add({
            emoji: "464988615207026698",

            async clicked(reaction: MessageReaction, user: User): Promise<void> {
                await reaction.message.channel.send(`${user.username} clicked`);
            },

            async removed(reaction: MessageReaction, user: User): Promise<void> {
                await reaction.message.channel.send(`${user.username} removed`);
            },

            async added(reaction: MessageReaction, user: User): Promise<void> {
                await reaction.message.channel.send(`${user.username} added`);
            },
        }).attach(context);
    }
};
