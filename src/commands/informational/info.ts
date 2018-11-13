import {IEmbedActionArgs, ActionType, IAction, Command, CommandContext, Utils, ChatEnvironment} from "@cloudrex/forge";
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

    readonly restrict: any = {
        environment: ChatEnvironment.Guild
    };

    public async executed(context: CommandContext): Promise<IAction<IEmbedActionArgs>> {
        let emojisString: string = context.message.guild.emojis.map((emoji: Emoji) => emoji.toString())
            .join(" ")
            .substr(0, 1024);

        const splitEmojis: string[] = emojisString.split(" ");

        emojisString = splitEmojis.slice(0, 15).join(" ");

        if (context.message.guild.emojis.size > 15) {
            emojisString += `**+ ${splitEmojis.length - 15} more**`;
        }

        return {
            type: ActionType.RichEmbed,

            args: {
                embed: new RichEmbed()
                    .addField("Guild", `${context.message.guild.name} (${context.message.guild.nameAcronym}) <${context.message.guild.id}>`)
                    .addField("Uptime", Utils.timeAgoFromNow(context.bot.client.uptime))
                    .addField("Members", context.message.guild.large ? `${context.message.guild.memberCount} (Large)` : context.message.guild.memberCount)
                    .addField("Created", Utils.timeAgo(context.message.guild.createdTimestamp))
                    .addField(`Emojis [${context.message.guild.emojis.size}]`, emojisString)
                    .setThumbnail(context.message.guild.iconURL)
                    .setColor("GREEN"),

                channelId: context.message.channel.id
            }
        };
    }
};
