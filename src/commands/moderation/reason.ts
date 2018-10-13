import {ChatEnvironment, Command, RestrictGroup, CommandContext} from "forge";
import {CommandType} from "../general/help";

// TODO: Update
export default class ReasonCommand extends Command {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "reason",
        description: "Manage moderation reasons"
    };

    readonly args = {
        caseNum: "!number",
        reason: "!string"
    };

    readonly restrict: any = {
        specific: [RestrictGroup.ServerModerator],
        environment: ChatEnvironment.Guild
    };

    public async executed(context: CommandContext): Promise<void> {
        // TODO
        await context.fail("Not implemented yet");
    }
};
