import {GuildMember, Snowflake} from "discord.js";
import {CommandOptions} from "discord-anvil/dist";
import ChatEnvironment from "discord-anvil/dist/core/chat-environment";
import CommandContext from "discord-anvil/dist/commands/command-context";
import DataProvider from "discord-anvil/dist/data-providers/data-provider";
import Log from "discord-anvil/dist/core/log";
import JsonProvider from "discord-anvil/dist/data-providers/json-provider";
import Utils from "discord-anvil/dist/core/utils";

export interface StoredWarning {
    readonly reason: string;
    readonly moderator: Snowflake;
    readonly time: number;
}

export default <CommandOptions>{
    meta: {
        name: "warnings",
        desc: "View the warnings of a member",

        args: {
            member: "!:member"
        }
    },

    restrict: {
        env: ChatEnvironment.Guild,

        specific: [
            "@285578743324606482", // Owner
            "&458130451572457483", // Trial mods
            "&458130847510429720", // Mods
            "&458812900661002260"  // Assistants
        ]
    },

    executed: (context: CommandContext): void => {
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
