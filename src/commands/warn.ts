import {ConsumerAPIv2} from "../warden-api";
import {CommandOptions} from "discord-anvil/dist";
import ChatEnvironment from "discord-anvil/dist/core/chat-environment";
import CommandContext from "discord-anvil/dist/commands/command-context";
import Utils from "discord-anvil/dist/core/utils";

export default <CommandOptions>{
    meta: {
        name: "warn",
        desc: "Warn an user",

        args: {
            user: "!:user",
            reason: "!string",
            evidence: "string"
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

    // TODO: Throws unknown message
    executed: async (context: CommandContext, api: ConsumerAPIv2): Promise<void> => { // TODO: api type not working for some reason
        const target = context.message.guild.member(Utils.resolveId(context.arguments[0].id));

        if (!target) {
            context.fail("Guild member not found");

            return;
        }
        else if (context.sender.id === target.user.id) {
            context.fail("You can't warn yourself");

            return;
        }
        else if (target.user.bot) {
            context.fail("You can't warn a bot");

            return;
        }

        await api.warn({
            moderator: context.sender,
            reason: context.arguments[1],
            user: target,
            evidence: context.arguments.length === 3 ? context.arguments[2] : undefined,
            message: context.message
        });
    }
};
