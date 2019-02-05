import {CommandType} from "../general/help";
import {GuildMember} from "discord.js";
import Mongo, {IDbMessage} from "../../database/mongo-database";
import {Name, Description, Aliases, Arguments, Type, Constraints, ChatEnv, Context} from "d.mix";

type ILocalArgs = {
    readonly member: GuildMember;
};

@Name("lastseen")
@Description("Display the last time a user was seen")
@Aliases("ls")
@Arguments(
    {
        name: "member",
        switchShortName: "m",
        type: Type.Member,
        required: true
    }
)
@Constraints({
    environment: ChatEnv.Guild,
    cooldown: 2
})
export default class extends Command<ILocalArgs> {
    readonly type = CommandType.Informational;

    public async run($: Context, args: ILocalArgs): Promise<IAction<IMessageActionArgs>> {
        if (args.member.id === $.bot.client.user.id) {
            return {
                type: ActionType.OkEmbed,

                args: {
                    channelId: $.msg.channel.id,
                    message: "Nice try"
                }
            };
        }

        const result: IDbMessage | undefined = (await Mongo.collections.messages.find({
            authorId: args.member.id
        }).sort({
            _id: -1
        }).limit(1).toArray())[0];

        if (result !== undefined) {
            return {
                type: ActionType.OkEmbed,

                args: {
                    channelId: $.msg.channel.id,
                    message: `:eyes: <@${args.member.id}> was last seen **${Utils.timeAgo(result.time, false)}**`
                }
            };
        }
        else {
            return {
                type: ActionType.FailEmbed,

                args: {
                    channelId: $.msg.channel.id,
                    message: `No recorded data for <@${args.member.id}>`
                }
            };
        }
    }
};
