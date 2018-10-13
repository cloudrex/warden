// TODO

// thumbs up -> +1 rep (auto)
// thumbs down -> -1 rep (auto)
import {Service, DiscordEvent} from "forge";
import {Message} from "discord.js";

export default class ReputationService extends Service {
    readonly meta = {
        name: "reputation",
        description: "Reputation system"
    };

    private handleReactionAdded(message: Message): void {
        //
    }

    public start(): void {
        this.bot.client.on(DiscordEvent.MessageReactionAdded, this.handleReactionAdded);
    }
}