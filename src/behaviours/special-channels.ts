import {Message} from "discord.js";
import {BehaviourOptions} from "discord-anvil";
import {Bot} from "discord-anvil";

export default <BehaviourOptions>{
    name: "Special Channels",
    description: "Functionality for special channels",

    enabled: (bot: Bot<any>, api: any): void => {
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
