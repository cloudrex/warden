import {Command, CommandContext} from "discord-anvil";
import SpecificGroups from "../specific-groups";
import {CommandType} from "./help";

export default class Test extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "test",
        description: "Test whether I can send messages in this channel"
    };

    constructor() {
        super();

        this.restrict.specific = SpecificGroups.staff;
    }

    public async executed(context: CommandContext): Promise<void> {
        // TODO: Check if the send message failed and display error, and check if embeds + files can be sent.
        if (context.message.channel.type === "text") {
            await context.ok("I can send messages in this channel.");
        }
    }
};
