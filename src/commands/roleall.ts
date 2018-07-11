import {CommandOptions} from "discord-anvil/dist";
import CommandContext from "discord-anvil/dist/commands/command-context";

export default <CommandOptions>{
    meta: {
        name: "roleall",
        desc: "Add a role to all members",

        args: {
            role: "!string"
        }
    },

    executed: (context: CommandContext): void => {
        // TODO
    }
};
