import { Command, CommandContext } from "discord-anvil";

export default abstract class ClearWarns extends Command {
    readonly meta = {
        name: "clearwarns",
        description: "Clear all warnings from an user"
    };

    readonly restrict = {
        specific: [
            "@285578743324606482" // Owner
        ]
    };

    executed(context: CommandContext): void {
        // TODO
    }
};
