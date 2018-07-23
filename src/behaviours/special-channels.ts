import {Message} from "discord.js";
import {Behaviour} from "discord-anvil";
import {Bot} from "discord-anvil";
import { ConsumerAPIv2 } from "../warden-api";

export class SpecialChannels extends Behaviour {
    readonly meta = {
        name: "special channels",
        description: "Functionality for special guild channels"
    };

    public enabled(bot: Bot, api: ConsumerAPIv2): void {
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
