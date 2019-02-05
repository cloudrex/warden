import {CommandType} from "../general/help";
import {Emoji, RichEmbed} from "discord.js";
import {ChatEnv, Command, Name, Description, Constraint, Context, IAction, IEmbedActionArgs, ActionType, Utils} from "d.mix";

// TODO: Bot should have a command to display info of itself, ex. uptime.
@Name("info")
@Description("View information about the server")
@Constraint.Env(ChatEnv.Guild)
export default class extends Command {
    readonly type = CommandType.Informational;

    public async run($: Context): Promise<IAction<IEmbedActionArgs>> {
        let emojisString: string = $.msg.guild.emojis.map((emoji: Emoji) => emoji.toString())
            .join(" ")
            .substr(0, 1024);

        const splitEmojis: string[] = emojisString.split(" ");

        emojisString = splitEmojis.slice(0, 15).join(" ");

        if ($.msg.guild.emojis.size > 15) {
            emojisString += `**+ ${splitEmojis.length - 15} more**`;
        }

        return {
            type: ActionType.RichEmbed,

            args: {
                embed: new RichEmbed()
                    .addField("Guild", `${$.msg.guild.name} (${$.msg.guild.nameAcronym}) <${$.msg.guild.id}>`)
                    .addField("Owner", `<@${$.msg.guild.ownerID}>`)
                    .addField("Region", $.msg.guild.region)
                    .addField("Verification Level", $.msg.guild.verificationLevel)
                    .addField("Members", $.msg.guild.large ? `${$.msg.guild.memberCount} (Large)` : $.msg.guild.memberCount)
                    .addField("Created", Utils.timeAgo($.msg.guild.createdTimestamp))
                    .addField(`Emojis [${$.msg.guild.emojis.size}]`, emojisString)
                    .setThumbnail($.msg.guild.iconURL)
                    .setColor("GREEN"),

                channelId: $.msg.channel.id
            }
        };
    }
};
