import {Channel, GuildChannel, TextChannel} from "discord.js";
import {CommandType} from "../general/help";
import Mongo, {ChannelType, IDbChannel} from "../../database/mongo-database";
import {Name, Description, Constraints, ChatEnv, RestrictGroup, Command, Context} from "d.mix";

@Name("backup")
@Description("Perform a backup of the server's channels and settings")
@Constraints({
    specific: [RestrictGroup.ServerOwner],
    cooldown: 3600,
    environment: ChatEnv.Guild
})
export default class BackupCommand extends Command {
    readonly type = CommandType.Utility;

    public async run($: Context) {
        // TODO: Missing channel permissions and guild settings

        const channels: IDbChannel[] = $.msg.guild.channels.filter((channel) => channel.type === "text" || channel.type === "voice")
            .map((channel: Channel) => {
                return {
                    id: channel.id,
                    name: (channel as GuildChannel).name,
                    type: channel.type === "text" ? ChannelType.Text : ChannelType.Voice,
                    topic: channel.type === "text" ? (channel as TextChannel).topic : undefined
                };
            });

        await Mongo.collections.backups.insertOne({
            time: Date.now(),
            guildId: $.msg.guild.id,
            channels: channels
        });

        await $.ok("Backup completed");
    }
};
