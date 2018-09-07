import {Command, CommandContext} from "discord-anvil";
import {CommandType} from "./help";

export default class Opt extends Command {
    readonly type = CommandType.Configuration;

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
