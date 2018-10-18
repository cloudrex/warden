import {Command, CommandContext, RestrictGroup, ChatEnvironment, Argument, InternalArgType} from "@cloudrex/forge";
import {CommandType} from "../general/help";
import {Snowflake} from "discord.js";
import WardenAPI from "../../core/warden-api";
import {DatabaseModerationAction} from "../../database/mongo-database";

type CaseArgs = {
    readonly caseId: Snowflake;
}

export default class CaseCommand extends Command<CaseArgs> {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "case",
        description: "Grab a moderation case"
    };

    readonly arguments: Argument[] = [
        {
            name: "caseId",
            type: InternalArgType.Snowflake,
            description: "The case to grab",
            required: true
        }
    ];

    readonly restrict: any = {
        specific: [RestrictGroup.ServerModerator],
        environment: ChatEnvironment.Guild
    };

    public async executed(context: CommandContext, args: CaseArgs): Promise<void> {
        const action: DatabaseModerationAction | null = await WardenAPI.retrieveModerationAction(args.caseId);

        if (action === null) {
            await context.fail("The specific case is not registered in the database");

            return;
        }

        await context.ok(action.reason);
    }
};
