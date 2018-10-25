import {Command, IArgument, CommandContext, ChatEnvironment, TrivialArgType, Utils, InternalArgType} from "@cloudrex/forge";
import {CommandType} from "../general/help";
import {Snowflake} from "discord.js";
import {DatabaseGuildConfig, GuildConfigChannelType} from "../../database/guild-config";

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

    public async executed(context: CommandContext, args: SetChannelArgs): Promise<void> {
        if (!Object.keys(GuildConfigChannelType).includes(args.type)) {
            await context.fail("Invalid channel type");

            return;
        }

        const channel: Snowflake = Utils.resolveId(args.channel);

        if (!context.message.guild.channels.has(channel)) {
            await context.fail("That channel does not exist");

            return;
        }

        await DatabaseGuildConfig.setChannel(args.type, channel, context.message.guild.id);
    }
};
