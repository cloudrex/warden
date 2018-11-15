import {Command, CommandContext, RestrictGroup, ChatEnvironment, IArgument, InternalArgType} from "@cloudrex/forge";
import {CommandType} from "../general/help";
import {Snowflake} from "discord.js";
import WardenAPI from "../../core/warden-api";
import {IDbModAction} from "../../database/mongo-database";

type CaseArgs = {
    readonly caseId: Snowflake;
}

export default class CaseCommand extends Command<CaseArgs> {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "case",
        description: "Grab a moderation case"
    };

    readonly arguments: IArgument[] = [
        {
            name: "caseId",
            type: InternalArgType.Snowflake,
            switchShortName: "i",
            description: "The case to grab",
            required: true
        }
    ];

    readonly restrict: any = {
        specific: [RestrictGroup.ServerModerator],
        environment: ChatEnvironment.Guild
    };

    public async executed(x: CommandContext, args: CaseArgs): Promise<void> {
        const action: IDbModAction | null = await WardenAPI.retrieveModerationAction(args.caseId);

        if (action === null) {
            await x.fail("The specified case is not registered in the database");

            return;
        }

        await x.msg.channel.send(WardenAPI.createModerationActionEmbed(action, action.automatic));
    }
};
