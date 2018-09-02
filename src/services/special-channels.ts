import {Message} from "discord.js";
import {Bot, Service} from "discord-anvil";

export default class SpecialChannels extends Service {
    readonly meta = {
        name: "special channels",
        description: "Functionality for special guild channels"
    };

    public start(): void {
        this.bot.client.on("message", async (message: Message) => {
            if (message.channel.id === this.api.unresolvedChannels.suggestions && !message.author.bot) {
                await this.api.addSuggestion(message.content, message.member);

                if (message.deletable) {
                    await message.delete();
                }
            }
        });
    }
}
