import {Command, CommandContext} from "discord-anvil";

export default class Opt extends Command {
    readonly meta = {
        name: "opt",
        description: "Configure the bot"
    };

    readonly args = {
        property: "!string",
        value: "!string"
    };

    readonly aliases = ["config", "cfg"];

    public executed(context: CommandContext): void {
        // TODO
    }
};
