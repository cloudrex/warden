import {ChatEnvironment, Command, RestrictGroup, CommandContext} from "@cloudrex/forge";
import {CommandType} from "../general/help";

// TODO: Update
export default class ReasonCommand extends Command {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "reason",
        description: "Manage moderation reasons"
    };

    // TODO: Update arg system
    readonly args = {
        caseNum: "!number",
        reason: "!string"
    };

    readonly restrict: any = {
        specific: [RestrictGroup.ServerModerator],
        environment: ChatEnvironment.Guild
    };

    public async executed(x: CommandContext): Promise<void> {
        // TODO
        await x.fail("Not implemented yet");
    }
};
