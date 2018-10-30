import {Command, IArgument, CommandContext, ChatEnvironment, TrivialArgType, Utils, InternalArgType} from "@cloudrex/forge";
import {CommandType} from "../general/help";
import {Snowflake} from "discord.js";
import {DatabaseGuildConfig, GuildConfigChannelType} from "../../database/guild-config";
import {IAction, ActionType} from "@cloudrex/forge/actions/action";
import {IRequestActionArgs} from "@cloudrex/forge/actions/action-interpreter";

type SetChannelArgs = {
    readonly type: GuildConfigChannelType;
    readonly channel: Snowflake;
};

export default class SetChannelCommand extends Command<SetChannelArgs> {
    readonly type = CommandType.Configuration;

    readonly meta = {
        name: "set-channel",
        description: "Configure channels"
    };

    readonly aliases = ["setchannel"];

    readonly arguments: IArgument[] = [
        {
            name: "type",
            description: "The type of channel to set",
            type: TrivialArgType.String,
            required: true
        },
        {
            name: "channel",
            description: "The channel",
            type: InternalArgType.Channel,
            required: true
        }
    ];

    readonly restrict: any = {
        environment: ChatEnvironment.Guild,
        cooldown: 3
    };

    public async executed(context: CommandContext, args: SetChannelArgs): Promise<IAction<IRequestActionArgs> | null> {
        if (!Object.keys(GuildConfigChannelType).includes(args.type)) {
            return {
                type: ActionType.FailEmbed,

                args: {
                    message: "Invalid channel type",
                    avatarUrl: context.sender.avatarURL,
                    channelId: context.message.channel.id,
                    requester: context.sender.username
                }
            };
        }

        const channel: Snowflake = Utils.resolveId(args.channel);

        if (!context.message.guild.channels.has(channel)) {
            return {
                type: ActionType.FailEmbed,

                args: {
                    message: "That channel does not exist",
                    avatarUrl: context.sender.avatarURL,
                    channelId: context.message.channel.id,
                    requester: context.sender.username
                }
            };
        }

        await DatabaseGuildConfig.setChannel(args.type, channel, context.message.guild.id);

        return null;
    }
};
