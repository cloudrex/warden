import {CommandOptions} from "discord-anvil/dist";
import CommandContext from "discord-anvil/dist/commands/command-context";

export default <CommandOptions>{
    meta: {
        name: "clearwarns",
        desc: "Clear all warnings from an user"
    },

    restrict: {
        specific: [
            "@285578743324606482" // Owner
        ]
    },

    executed: (context: CommandContext): void => {
        // TODO
    }
};
