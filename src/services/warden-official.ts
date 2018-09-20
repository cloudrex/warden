import {Message} from "discord.js";
import {Bot, Service} from "discord-anvil";
import {on} from "discord-anvil/dist";

export default class WardenOfficial extends Service {
    readonly meta = {
        name: "warden official",
        description: "Custom functionality for Warden's official server"
    };

    @on("message")
    public handleMessage(message: Message): void {
        console.log("got message @ warden official")
    }

    public start(): void {
        console.log("message from warden official");
    }
}
