import {Command, CommandContext} from "forge";
import {CommandType} from "../general/help";
import {Argument} from "forge/dist";
import {RestrictGroup} from "forge/dist/commands/command";
import ChatEnvironment from "forge/dist/core/chat-environment";


export default class CaseCommand extends Command {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "case",
        description: "Grab a moderation case"
    };

    readonly arguments: Argument[] = [
        // TODO
    ];

    readonly restrict: any = {
        specific: [RestrictGroup.ServerModerator],
        environment: ChatEnvironment.Guild
    };

    public async executed(context: CommandContext): Promise<void> {
        // TODO
        await context.fail("Not yet implemented");
    }
};
