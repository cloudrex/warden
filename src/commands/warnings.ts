import {GuildMember, RichEmbed, Snowflake} from "discord.js";
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
import {CommandType} from "./help";
import Mongo, {DatabaseModerationAction} from "../database/mongo-database";
import {CommandRestrictGroup} from "discord-anvil/dist/commands/command";

export interface StoredWarning {
    readonly reason: string;
    readonly moderator: Snowflake;
    readonly time: number;
}

interface WarningsArgs {
    readonly member: GuildMember;
}

export default class Warnings extends Command {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "warnings",
        description: "View the warnings of a member",
    };

    readonly aliases = ["warns"];

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
        this.restrict.specific = [CommandRestrictGroup.ServerModerator];
    }

    private static getDate(warning: DatabaseModerationAction): string {
        const date: Date = new Date(warning.time);

        return `${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`;
    }

    public async executed(context: CommandContext, args: WarningsArgs): Promise<void> {
        const warnings: Array<DatabaseModerationAction> = await Mongo.collections.moderationActions.find({
            memberId: args.member.id
        }).toArray();

        const warningsMessage: string = warnings.length > 0 ? warnings.map((warning: DatabaseModerationAction) => `**${Warnings.getDate(warning)}** ${warning.reason}`).join("\n") : "*This user has no recorded warnings*";

        const embed: RichEmbed = new RichEmbed()
            .addField("Warnings", warningsMessage)
            .setFooter(`Requested by ${context.sender.tag}`, context.sender.avatarURL)
            .setThumbnail(args.member.user.avatarURL);

        if (warnings.length > 0) {
            embed.addField("Total Warnings", warnings.length);
            embed.addField("Last Warning", Utils.timeAgo(warnings[warnings.length - 1].time));
        }

        // Color classification
        if (warnings.length === 0) {
            embed.setColor("GREEN");
        }
        else if (warnings.length < 5) {
            embed.setColor("BLUE");
        }
        else if (warnings.length >= 5 && warnings.length < 10) {
            embed.setColor("GOLD");
        }
        else if (warnings.length >= 10) {
            embed.setColor("RED");
        }

        await context.message.channel.send(embed);
    }
};
