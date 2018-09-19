import {Command, Permission, Utils} from "discord-anvil";
import {Channel, GuildChannel, TextChannel} from "discord.js";
import {CommandType} from "../general/help";
import Mongo, {ChannelType, DatabaseChannel} from "../../database/mongo-database";
import {RestrictGroup} from "discord-anvil/dist/commands/command";
import CommandContext from "discord-anvil/dist/commands/command-context";

export default class Backup extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "backup",
        description: "Perform a backup of the server's channels and settings"
    };

    constructor() {
        super();

        this.restrict.specific = [RestrictGroup.ServerOwner];
        this.restrict.cooldown = 3600;
    }

    public async executed(context: CommandContext): Promise<void> {
        // TODO: Missing channel permissions and guild settings

        const channels: Array<DatabaseChannel> = context.message.guild.channels.filter((channel) => channel.type === "text" || channel.type === "voice").map((channel: Channel) => {
            return {
                id: channel.id,
                name: (channel as GuildChannel).name,
                type: channel.type === "text" ? ChannelType.Text : ChannelType.Voice,
                topic: channel.type === "text" ? (channel as TextChannel).topic : undefined
            };
        });

        await Mongo.collections.backups.insertOne({
            time: Date.now(),
            guildId: context.message.guild.id,
            channels: channels
        });

        await context.ok("Backup completed");
    }
};
