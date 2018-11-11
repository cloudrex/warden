import {IRequestActionArgs, IAction, ActionType, Command, IArgument, CommandContext, ChatEnvironment, TrivialArgType} from "@cloudrex/forge";
import {CommandType} from "../general/help";
import {DatabaseGuildConfig, GuildConfigChannelType, GuildConfig} from "../../database/guild-config";

type GetChannelArgs = {
    readonly type: GuildConfigChannelType;
};

export default class GetChannelCommand extends Command<GetChannelArgs> {
    readonly type = CommandType.Configuration;

    readonly meta = {
        name: "get-channel",
        description: "Retrieve configured channels"
    };

    readonly aliases = ["getchannel"];

    readonly arguments: IArgument[] = [
        {
            name: "type",
            description: "The type of channel to retrieve",
            type: TrivialArgType.String,
            required: true
        },
    ];

    readonly restrict: any = {
        environment: ChatEnvironment.Guild,
        cooldown: 3
    };

    public async executed(context: CommandContext, args: GetChannelArgs): Promise<IAction<IRequestActionArgs>> {
        if (!Object.keys(GuildConfigChannelType).includes(args.type)) {
            return {
                type: ActionType.FailEmbed,

                args: {
                    message: "Invalid channel arg type",
                    channelId: context.message.channel.id,
                    requester: context.sender.username,
                    avatarUrl: context.sender.avatarURL
                }
            };
        }

        const guildConfig: GuildConfig | null = await DatabaseGuildConfig.get(context.message.guild.id);

        if (guildConfig === null || !guildConfig.modLogChannel) {
            return {
                type: ActionType.FailEmbed,

                args: {
                    message: "That channel has not been configured yet",
                    channelId: context.message.channel.id,
                    requester: context.sender.username,
                    avatarUrl: context.sender.avatarURL
                }
            };
        }

        return {
            type: ActionType.OkEmbed,

            args: {
                message: `<#${guildConfig.modLogChannel}>`,
                channelId: context.message.channel.id,
                requester: context.sender.username,
                avatarUrl: context.sender.avatarURL
            }
        };
    }
};
