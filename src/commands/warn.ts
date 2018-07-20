import {ConsumerAPIv2} from "../warden-api";
import { Command, ChatEnvironment, CommandContext, Utils } from "discord-anvil";

export default abstract class Warn extends Command {
    readonly meta = {
        name: "warn",
        description: "Warn an user"
    };

    readonly args = {
        user: "!:user",
        reason: "!string",
        evidence: "string"
    };

    readonly restrict = {
        env: ChatEnvironment.Guild,

        specific: [
            "@285578743324606482", // Owner
            "&458130451572457483", // Trial mods
            "&458130847510429720", // Mods
            "&458812900661002260"  // Assistants
        ]
    };

    // TODO: Throws unknown message
    async executed(context: CommandContext, api: ConsumerAPIv2): Promise<void> { // TODO: api type not working for some reason
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
