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

    readonly restrict: any = {
        environment: ChatEnvironment.Guild
    };

    public async executed(x: CommandContext): Promise<IAction<IEmbedActionArgs>> {
        let emojisString: string = x.msg.guild.emojis.map((emoji: Emoji) => emoji.toString())
            .join(" ")
            .substr(0, 1024);

        const splitEmojis: string[] = emojisString.split(" ");

        emojisString = splitEmojis.slice(0, 15).join(" ");

        if (x.msg.guild.emojis.size > 15) {
            emojisString += `**+ ${splitEmojis.length - 15} more**`;
        }

        return {
            type: ActionType.RichEmbed,

            args: {
                embed: new RichEmbed()
                    .addField("Guild", `${x.msg.guild.name} (${x.msg.guild.nameAcronym}) <${x.msg.guild.id}>`)
                    .addField("Owner", `<@${x.msg.guild.ownerID}>`)
                    .addField("Region", x.msg.guild.region)
                    .addField("Verification Level", x.msg.guild.verificationLevel)
                    .addField("Members", x.msg.guild.large ? `${x.msg.guild.memberCount} (Large)` : x.msg.guild.memberCount)
                    .addField("Created", Utils.timeAgo(x.msg.guild.createdTimestamp))
                    .addField(`Emojis [${x.msg.guild.emojis.size}]`, emojisString)
                    .setThumbnail(x.msg.guild.iconURL)
                    .setColor("GREEN"),

                channelId: x.msg.channel.id
            }
        };
    }
};
