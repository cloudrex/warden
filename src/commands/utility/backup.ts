import {Command, RestrictGroup, CommandContext, ChatEnvironment} from "@cloudrex/forge";
import {Channel, GuildChannel, TextChannel} from "discord.js";
import {CommandType} from "../general/help";
import Mongo, {ChannelType, IDbChannel} from "../../database/mongo-database";

export default class BackupCommand extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "backup",
        description: "Perform a backup of the server's channels and settings"
    };

    readonly restrict: any = {
        specific: [RestrictGroup.ServerOwner],
        cooldown: 3600,
        environment: ChatEnvironment.Guild
    };

    public async executed(x: CommandContext): Promise<void> {
        // TODO: Missing channel permissions and guild settings

        const channels: IDbChannel[] = x.msg.guild.channels.filter((channel) => channel.type === "text" || channel.type === "voice").map((channel: Channel) => {
            return {
                id: channel.id,
                name: (channel as GuildChannel).name,
                type: channel.type === "text" ? ChannelType.Text : ChannelType.Voice,
                topic: channel.type === "text" ? (channel as TextChannel).topic : undefined
            };
        });

        await Mongo.collections.backups.insertOne({
            time: Date.now(),
            guildId: x.msg.guild.id,
            channels: channels
        });

        await x.ok("Backup completed");
    }
};
