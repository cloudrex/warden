import {GuildMember, Snowflake} from "discord.js";
import {
    ChatEnvironment,
    Command,
    CommandArgument,
    CommandContext,
    DataProvider,
    JsonProvider,
    Log,
    Utils
} from "discord-anvil";
import SpecificGroups from "../specific-groups";

export interface StoredWarning {
    readonly reason: string;
    readonly moderator: Snowflake;
    readonly time: number;
}

interface WarningsArgs {
    readonly member: GuildMember;
}

export default class Warnings extends Command {
    readonly meta = {
        name: "warnings",
        description: "View the warnings of a member",
    };

    readonly arguments: Array<CommandArgument> = [
        {
            name: "member",
            type: "member",
            description: "The member to inspect",
            required: true
        }
    ];

    constructor() {
        super();

        this.restrict.environment = ChatEnvironment.Guild;
        this.restrict.specific = SpecificGroups.staff;
    }

    public executed(context: CommandContext, args: WarningsArgs): void {
        let dataProvider: DataProvider | undefined = context.bot.dataStore;

        if (!dataProvider) {
            Log.error("[Warnings.executed] Expecting data provider");
            context.fail("No data provider");

            return;
        }
        else if (!(dataProvider instanceof JsonProvider)) {
            Log.error("[Warnings.executed] Expecting data provider to be of type 'JsonProvider'");
            context.fail("Invalid data provider type");

            return;
        }

        const warnings: Array<StoredWarning> = dataProvider.get(`warnings.u${args.member.id}`);

        if (!warnings) {
            context.ok("This user has no warnings.");

            return;
        }

        context.ok(warnings.map((warning: StoredWarning, index: number) => `**${index + 1}**. ${warning.reason} - ${Utils.timeAgo(warning.time)}`).join("\n"));
    }
};
