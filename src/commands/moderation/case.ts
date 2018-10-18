import {Command, CommandContext, RestrictGroup, ChatEnvironment, Argument} from "@cloudrex/forge";
import {CommandType} from "../general/help";


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
