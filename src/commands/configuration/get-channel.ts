import {Command, Argument, CommandContext, ChatEnvironment, PrimitiveArgType} from "@cloudrex/forge";
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

    readonly arguments: Argument[] = [
        {
            name: "type",
            description: "The type of channel to retrieve",
            type: PrimitiveArgType.String,
            required: true
        },
    ];

    readonly restrict: any = {
        environment: ChatEnvironment.Guild,
        cooldown: 3
    };

    public async executed(context: CommandContext, args: GetChannelArgs): Promise<void> {
        if (!Object.keys(GuildConfigChannelType).includes(args.type)) {
            await context.fail("Invalid channel type");

            return;
        }

        const guildConfig: GuildConfig | null = await DatabaseGuildConfig.get(context.message.guild.id);

        if (guildConfig === null || !guildConfig.modLogChannel) {
            await context.fail("That channel has not been configured yet");

            return;
        }

        await context.ok(`<@${guildConfig.modLogChannel}>`);
    }
};
