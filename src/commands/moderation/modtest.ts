import WardenAPI from "../../core/warden-api";
import {ChatEnvironment, Command, CommandContext, RestrictGroup} from "@cloudrex/forge";
import {CommandType} from "../general/help";

export default class ModTestCommand extends Command {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "modtest",
        description: "Test the ModLog channel"
    };

    readonly restrict: any = {
        specific: [RestrictGroup.ServerModerator],
        environment: ChatEnvironment.Guild
    };

    public async executed(x: CommandContext, args: any, api: WardenAPI): Promise<void> {
        // TODO
        await x.fail("Not yet implemented");
    }
};
