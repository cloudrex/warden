import {Message} from "discord.js";
import {Bot, Service} from "discord-anvil";
import {on, command} from "discord-anvil/dist";
import WardenAPI from "../core/warden-api";

export default class WardenOfficial extends Service {
    readonly meta = {
        name: "warden official",
        description: "Custom functionality for Warden's official server"
    };

    @command("xtest", "Test decorator commands")
    public xtestCommand(): void {
        console.log("xtest command executed!");
    }

    @on("message")
    private async handleMessage(message: Message): Promise<void> {
        // TODO: this.api is undefined (decorator functions may been to be .bind())
        /* if (message.channel.id === (this.api as WardenAPI).unresolvedChannels.suggestions) {
            await this.api.addSuggestion(message.content, message.member);

            if (message.deletable) {
                await message.delete();
            }
        } */
    }

    public start(): void {
        console.log("message from warden official");
    }
}
