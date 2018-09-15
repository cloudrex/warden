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
import SpecificGroups from "../specific-groups";
import {CommandType} from "./help";
import Mongo, {DatabaseModerationAction} from "../database/mongo-database";

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
        this.restrict.specific = SpecificGroups.staff;
    }

    private getDate(warning: DatabaseModerationAction): string {
        const date: Date = new Date(warning.time);

        return `${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`;
    }

    public async executed(context: CommandContext, args: WarningsArgs): Promise<void> {
        const warnings: Array<DatabaseModerationAction> = await Mongo.collections.moderationActions.find({
            memberId: args.member.id
        }).toArray();

        const message: string = warnings.length > 0 ? warnings.map((warning: DatabaseModerationAction) => `${this.getDate(warning)} ${warning.reason}`).join("\n") : "*This user has no recorded warnings*";

        await context.message.channel.send(new RichEmbed()
            .setDescription(message)
            .setFooter(`${warnings.length} warnings on record`)
            .setThumbnail(args.member.user.avatarURL));
    }
};
