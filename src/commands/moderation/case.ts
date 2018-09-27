import {Command, CommandContext} from "discord-anvil";
import {CommandType} from "../general/help";
import {Argument} from "discord-anvil/dist";
import {RestrictGroup} from "discord-anvil/dist/commands/command";
import ChatEnvironment from "discord-anvil/dist/core/chat-environment";


export default class CaseCommand extends Command {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "case",
        description: "Grab data of a case"
    };

    readonly arguments: Array<Argument> = [
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
