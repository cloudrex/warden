import {ConsumerAPIv2} from "../warden-api";
import { Command, Permission, ChatEnvironment, CommandContext } from "discord-anvil";
import SpecificGroups from "../specific-groups";

export default class Mute extends Command {
    readonly meta = {
        name: "mute",
        description: "Mute a user"
    };

    readonly args = {
        user: "!:member",
        reason: "!string",
        evidence: "string"
    };


    constructor() {
        super();

        this.restrict.selfPermissions = [Permission.ManageRoles];
        this.restrict.issuerPermissions = [Permission.ManageRoles];
        this.restrict.environment = ChatEnvironment.Guild;
        this.restrict.specific = SpecificGroups.staff;
    }

    public async executed(context: CommandContext, api: ConsumerAPIv2): Promise<void> {
        const target = context.arguments[0];
        const modLog = context.message.guild.channels.get("458794765308395521");

        if (!target) {
            context.fail("Guild member not found");

            return;
        }
        else if (!modLog) {
            context.fail("ModLog channel not found");

            return;
        }

        await api.reportCase({
            member: target,
            title: "Mute",
            evidence: context.arguments.length === 3 ? context.arguments[2] : undefined,
            moderator: context.message.author,
            reason: context.arguments[1],
            color: "GOLD"
        });
    }
};
