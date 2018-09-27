// TODO

// thumbs up -> +1 rep (auto)
// thumbs down -> -1 rep (auto)
import {Service, on} from "discord-anvil";
import {Message} from "discord.js";
import {DiscordEvent} from "discord-anvil/dist/decorators/decorators";

export default class ReputationService extends Service {
    readonly meta = {
        name: "reputation",
        description: "Reputation system"
    };

    @on(DiscordEvent.MessageReactionAdded)
    public handleReaction(message: Message): void {
        // TODO
        console.log("REACTION ADDED!");
    }

    public start(): void {
        //
    }
}