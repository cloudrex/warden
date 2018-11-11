import {IMessageActionArgs, IAction, ActionType, Command, CommandContext, Utils, InternalArgType, IArgument, ChatEnvironment} from "@cloudrex/forge";
import {CommandType} from "../general/help";
import {GuildMember} from "discord.js";
import Mongo, {IDbMessage} from "../../database/mongo-database";

type LastSeenArgs = {
    readonly member: GuildMember;
};

export default class LastSeenCommand extends Command<LastSeenArgs> {
    readonly type = CommandType.Informational;

    readonly meta = {
        name: "lastseen",
        description: "Display the last time a user was seen"
    };

    readonly aliases = ["ls"];

    readonly arguments: IArgument[] = [
        {
            name: "member",
            switchShortName: "m",
            type: InternalArgType.Member,
            required: true
        }
    ];

    readonly restrict: any = {
        environment: ChatEnvironment.Guild,
        cooldown: 2
    };

    public async executed(context: CommandContext, args: LastSeenArgs): Promise<IAction<IMessageActionArgs>> {
        if (args.member.id === context.bot.client.user.id) {
            return {
                type: ActionType.OkEmbed,

                args: {
                    channelId: context.message.channel.id,
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
                    channelId: context.message.channel.id,
                    message: `:eyes: <@${args.member.id}> was last seen **${Utils.timeAgo(result.time, false)}**`
                }
            };
        }
        else {
            return {
                type: ActionType.FailEmbed,

                args: {
                    channelId: context.message.channel.id,
                    message: `No recorded data for <@${args.member.id}>`
                }
            };
        }
    }
};
