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

    public async executed(x: CommandContext, args: GetChannelArgs): Promise<IAction<IRequestActionArgs>> {
        if (!Object.keys(GuildConfigChannelType).includes(args.type)) {
            return {
                type: ActionType.FailEmbed,

                args: {
                    message: "Invalid channel arg type",
                    channelId: x.msg.channel.id,
                    requester: x.sender.username,
                    avatarUrl: x.sender.avatarURL
                }
            };
        }

        const guildConfig: GuildConfig | null = await DatabaseGuildConfig.get(x.msg.guild.id);

        if (guildConfig === null || !guildConfig.modLogChannel) {
            return {
                type: ActionType.FailEmbed,

                args: {
                    message: "That channel has not been configured yet",
                    channelId: x.msg.channel.id,
                    requester: x.sender.username,
                    avatarUrl: x.sender.avatarURL
                }
            };
        }

        return {
            type: ActionType.OkEmbed,

            args: {
                message: `<#${guildConfig.modLogChannel}>`,
                channelId: x.msg.channel.id,
                requester: x.sender.username,
                avatarUrl: x.sender.avatarURL
            }
        };
    }
};
