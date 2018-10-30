import {Command, CommandContext, RestrictGroup, EmojiMenu} from "@cloudrex/forge";
import {Message, MessageReaction, User} from "discord.js";
import {IAction, ActionType} from "@cloudrex/forge/actions/action";
import {IMessageActionArgs} from "@cloudrex/forge/actions/action-interpreter";

export default class TestECommand extends Command {
    readonly meta = {
        name: "etest",
        description: "Test debugging stuff"
    };

    readonly restrict: any = {
        specific: [RestrictGroup.BotOwner]
    };

    public async executed(context: CommandContext): Promise<IAction<IMessageActionArgs>> {
        /* const sent: Message = await context.message.channel.send("Hello world") as Message;
        const menu: EmojiMenu = new EmojiMenu(sent.id, context.sender.id);

        await menu.add({
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
        }).attach(context); */

        return {
            type: ActionType.Message,

            args: {
                channelId: context.message.channel.id,
                message: "hello world!"
            }
        };
    }
};
