import {CommandOptions} from "discord-anvil/dist";
import ChatEnvironment from "discord-anvil/dist/core/chat-environment";
import CommandContext from "discord-anvil/dist/commands/command-context";


export default <CommandOptions>{
    meta: {
        name: "reason",
        desc: "Manage moderation reasons",

        args: {
            caseNum: "!number",
            reason: "!string"
        }
    },

    restrict: {
        env: ChatEnvironment.Guild,

        specific: [
            "@285578743324606482", // Owner
            "&458130451572457483", // Trial mods
            "&458130847510429720", // Mods
            "&458812900661002260"  // Assistants
        ]
    },

    executed: (context: CommandContext): void => {
        // TODO
    }
};
