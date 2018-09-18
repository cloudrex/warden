import {Command, CommandContext} from "discord-anvil";
import {CommandType} from "../general/help";
import {CommandArgument} from "discord-anvil/dist";
import {CommandRestrictGroup} from "discord-anvil/dist/commands/command";
import Mongo from "../../database/mongo-database";
import {GuildMember} from "discord.js";
import ChatEnvironment from "discord-anvil/dist/core/chat-environment";

type ClearWarnsArgs = {
    readonly member: GuildMember;
};

export default class ClearWarns extends Command {
    readonly type = CommandType.Moderation;

    readonly aliases = ["clearwarnings"];

    readonly meta = {
        name: "clearwarns",
        description: "Clear all warnings from an user"
    };

    readonly arguments: Array<CommandArgument> = [
        {
            name: "member",
            description: "The target user",
            type: "member",
            required: true
        }
    ];

    constructor() {
        super();

        this.restrict.environment = ChatEnvironment.Guild;
        this.restrict.specific = [CommandRestrictGroup.ServerModerator];
    }

    public async executed(context: CommandContext, args: ClearWarnsArgs): Promise<void> {
        await Mongo.collections.moderationActions.deleteMany({
            memberId: args.member.id,
            guildId: context.message.guild.id
        });

        await context.ok(`Cleared all warnings of <@${args.member.id}> (${args.member.user.tag}:${args.member.id})`);
    }
};
