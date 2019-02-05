import {Message} from "discord.js";
import {loaded, ne} from "../commands/ai/spam-train";
import {Name, Description, Service} from "d.mix";

@Name("ai")
@Description("Autonomous AI protection system")
export default class extends Service {
    public start(): void {
        this.bot.client.on("message", async (message: Message) => {
            if (!message.author.bot && message.channel.id === "492138339223339016") {
                if (!loaded) {
                    const response: Message = await message.reply("AI Network not yet loaded, please wait a moment!") as Message;

                    if (response && response.deletable) {
                        await response.delete(4000);
                    }
                }
                else {
                    if ((ne as NeuralNetwork).run(message.content) === "spammy") {
                        if (message.deletable) {
                            await message.delete();
                        }
                        else {
                            await message.reply("Your message was detected as spam, but I can't delete the message! (Maybe I don't have permission)");
                        }
                    }
                }
            }
        });
    }
}
