import {Command, IFragmentMeta, IAction, IEmbedActionArgs, CommandContext, ActionType, RestrictGroup, Utils} from "@cloudrex/forge";
import {RichEmbed} from "discord.js";
import os from "os";

export default class StatusCommand extends Command {
    readonly meta: IFragmentMeta = {
        name: "status",
        description: "View the bot's status"
    };

    readonly restrict: any = {
        specific: [RestrictGroup.BotOwner]
    };

    readonly aliases: string[] = ["uptime"];

    public executed(x: CommandContext): IAction<IEmbedActionArgs> {
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
                    .addField("Uptime", Utils.timeAgoFromNow(x.bot.client.uptime)),

                channelId: x.channel.id
            }
        };
    }
}