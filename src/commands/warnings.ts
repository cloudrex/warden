import {GuildMember, Snowflake} from "discord.js";
import { Command, ChatEnvironment, CommandContext, DataProvider, Log, JsonProvider, Utils } from "discord-anvil";
import SpecificGroups from "../specific-groups";

export interface StoredWarning {
    readonly reason: string;
    readonly moderator: Snowflake;
    readonly time: number;
}

export default class Warnings extends Command {
    readonly meta = {
        name: "warnings",
        description: "View the warnings of a member",
    };

    readonly args = {
        member: "!:member"
    };

    constructor() {
        super();

        this.restrict.environment = ChatEnvironment.Guild;
        this.restrict.specific = SpecificGroups.staff;
    }

    public executed(context: CommandContext): void {
        const member: GuildMember = context.arguments[0];

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

        const warnings: Array<StoredWarning> = dataProvider.get(`warnings.u${member.id}`);

        if (!warnings) {
            context.ok("This user has no warnings.");

            return;
        }

        context.ok(warnings.map((warning: StoredWarning, index: number) => `**${index + 1}**. ${warning.reason} - ${Utils.timeAgo(warning.time)}`).join("\n"));
    }
};
