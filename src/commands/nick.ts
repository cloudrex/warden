import {CommandOptions} from "discord-anvil/dist";
import Permission from "discord-anvil/dist/core/permission";
import CommandContext from "discord-anvil/dist/commands/command-context";

export default <CommandOptions>{
    meta: {
        name: "nick",
        desc: "Manage nicknames",
        aliases: ["nickname"],

        args: {
            name: "!string"
        }
    },

    restrict: {
        selfPerms: [Permission.ManageNicknames]
    },

    executed: async (context: CommandContext): Promise<void> => {
        await context.message.member.setNickname(context.arguments[0]);
    }
};
