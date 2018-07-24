import {Message} from "discord.js";
import {Behaviour} from "discord-anvil";
import {Bot} from "discord-anvil";
import { WardenAPI } from "../warden-api";

export default class SpecialChannels extends Behaviour {
    readonly meta = {
        name: "special channels",
        description: "Functionality for special guild channels"
    };

    public enabled(bot: Bot, api: WardenAPI): void {
        bot.client.on("message", async (message: Message) => {
            if (message.channel.id === api.unresolvedChannels.suggestions && !message.author.bot) {
                await api.addSuggestion(message.content, message.member);

                if (message.deletable) {
                    await message.delete();
                }
            }
        });
    }
}
