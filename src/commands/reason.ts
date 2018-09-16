import {ChatEnvironment, Command, CommandContext} from "discord-anvil";
import SpecificGroups from "../specific-groups";
import {CommandType} from "./help";
import {CommandRestrictGroup} from "discord-anvil/dist/commands/command";

export default class Reason extends Command {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "reason",
        description: "Manage moderation reasons"
    };

    readonly args = {
        caseNum: "!number",
        reason: "!string"
    };

    constructor() {
        super();

        this.restrict.environment = ChatEnvironment.Guild;
        this.restrict.specific = [CommandRestrictGroup.ServerModerator];
    }

    public async executed(context: CommandContext): Promise<void> {
        // TODO
        await context.fail("Not implemented yet");
    }
};
