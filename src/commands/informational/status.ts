import {RichEmbed} from "discord.js";
import os from "os";
import {Name, Description, Constraint, Aliases, RestrictGroup, IAction, Command, IEmbedActionArgs, Context, ActionType, Utils} from "d.mix";

@Name("status")
@Description("View the bot's status")
@Aliases("uptime")
@Constraint.Specific([RestrictGroup.BotOwner])
export default class StatusCommand extends Command {
    public run($: Context): IAction<IEmbedActionArgs> {
        const totalMemory: number = (os.totalmem() / 1E+9).toFixed(2) as any;
        const freeMemory: number = (os.freemem() / 1E+9).toFixed(2) as any;
        const usedMemory: number = (totalMemory - freeMemory).toFixed(2) as any;

        return {
            type: ActionType.RichEmbed,

            args: {
                embed: new RichEmbed()
                    .setColor("GREEN")
                    .addField("Memory Usage", `**${usedMemory}**gb/**${totalMemory}**gb (**${freeMemory}**gb Free)`)
                    .addField("Architecture", os.arch())
                    .addField("Process Priority", os.getPriority() || "Normal")
                    .addField("Platform", os.platform())
                    .addField("Release", os.release())
                    .addField("Type", os.type())
                    .addField("Uptime", Utils.timeAgoFromNow($.bot.client.uptime)),

                channelId: $.channel.id
            }
        };
    }
}
