import {Command, CommandContext} from "discord-anvil";
import SpecificGroups from "../specific-groups";
import {CommandType} from "./help";

export default class ClearWarns extends Command {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "clearwarns",
        description: "Clear all warnings from an user"
    };

    constructor() {
        super();

        this.restrict.specific = SpecificGroups.owner;
    }

    public executed(context: CommandContext): void {
        // TODO
    }
};
