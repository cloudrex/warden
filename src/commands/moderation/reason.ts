import {ChatEnvironment, Command} from "discord-anvil";
import {CommandType} from "../general/help";
import {RestrictGroup} from "discord-anvil/dist/commands/command";
import CommandContext from "discord-anvil/dist/commands/command-context";

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
        this.restrict.specific = [RestrictGroup.ServerModerator];
    }

    public async executed(context: CommandContext): Promise<void> {
        // TODO
        await context.fail("Not implemented yet");
    }
};
