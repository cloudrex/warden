import {Command, CommandContext} from "discord-anvil";
import {CommandType} from "./help";
import Permission from "discord-anvil/dist/core/permission";

export default class ClearWarns extends Command {
    readonly type = CommandType.Moderation;

    readonly aliases = ["clearwarnings"];

    readonly meta = {
        name: "clearwarns",
        description: "Clear all warnings from an user"
    };

    constructor() {
        super();

        this.restrict.issuerPermissions = [Permission.ManageGuild];
    }

    public async executed(context: CommandContext): Promise<void> {
        // TODO
        await context.fail("Action not yet implemented.");
    }
};
