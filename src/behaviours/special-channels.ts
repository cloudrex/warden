import {Message} from "discord.js";
import {BehaviourOptions} from "discord-anvil/dist/behaviours/behaviour";
import Bot from "discord-anvil/dist/core/bot";

export default <BehaviourOptions>{
    name: "Special Channels",
    description: "Functionality for special channels",

    enabled: (bot: Bot, api: any): void => {
        bot.client.on("message", async (message: Message) => {
            if (message.channel.id === api.unresolvedChannels.suggestions && !message.author.bot) {
                await api.addSuggestion(message.content, message.member);

                if (message.deletable) {
                    await message.delete();
                }
            }
        });
    }
};
