import {Command, CommandContext, Permission, Utils} from "discord-anvil";
import {CommandType} from "../general/help";
import {Emoji, RichEmbed} from "discord.js";

// TODO: Bot should have a command to display info of itself, ex. uptime.
export default class InfoCommand extends Command {
    readonly type = CommandType.Informational;

    readonly meta = {
        name: "info",
        description: "View information about the server"
    };

    readonly aliases = ["uptime"];

    public async executed(context: CommandContext): Promise<void> {
        await context.message.channel.send(new RichEmbed()
            .addField("Guild", `${context.message.guild.name} (${context.message.guild.nameAcronym}) <${context.message.guild.id}>`)
            .addField("Uptime", Utils.timeAgoFromNow(context.bot.client.uptime))
            .addField("Members", context.message.guild.large ? `${context.message.guild.memberCount} (Large)` : context.message.guild.memberCount)
            .addField("Created", Utils.timeAgo(context.message.guild.createdTimestamp))
            .addField(`Emojis [${context.message.guild.emojis.size}]`, context.message.guild.emojis.map((emoji: Emoji) => `<:${emoji.name}:${emoji.id}>`).join(" ").substr(0, 1024))
            .setThumbnail(context.message.guild.iconURL)
            .setColor("GREEN"));
    }
};
