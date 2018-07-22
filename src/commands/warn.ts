import {ConsumerAPIv2} from "../warden-api";
import { Command, ChatEnvironment, CommandContext, Utils } from "discord-anvil";
import SpecificGroups from "../specific-groups";

export default class Warn extends Command {
    readonly meta = {
        name: "warn",
        description: "Warn an user"
    };

    readonly args = {
        user: "!:user",
        reason: "!string",
        evidence: "string"
    };

    constructor() {
        super();
        
        this.restrict.environment = ChatEnvironment.Guild;
        this.restrict.specific = SpecificGroups.staff;
    }

    // TODO: Throws unknown message
    public async executed(context: CommandContext, api: ConsumerAPIv2): Promise<void> { // TODO: api type not working for some reason
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
