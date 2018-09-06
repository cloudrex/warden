import {ChatEnvironment, Command, CommandContext} from "discord-anvil";
import SpecificGroups from "../specific-groups";

export default class Reason extends Command {
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
        this.restrict.specific = SpecificGroups.staff;
    }

    public executed(context: CommandContext): void {
        // TODO
    }
};
