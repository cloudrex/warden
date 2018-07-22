import { Command, CommandContext } from "discord-anvil";

export default class ClearWarns extends Command {
    readonly meta = {
        name: "clearwarns",
        description: "Clear all warnings from an user"
    };

    constructor() {
        super();

        this.restrict.specific = ["@285578743324606482"]; // Owner
    }

    public executed(context: CommandContext): void {
        // TODO
    }
};
