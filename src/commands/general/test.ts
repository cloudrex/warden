import {IAction, ActionType, IPrivateMessageActionArgs, Command, CommandContext, RestrictGroup} from "@cloudrex/forge";
import {CommandType} from "./help";
import {TextChannel, Permissions} from "discord.js";

export default class TestCommand extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "test",
        description: "Test whether I can send messages in this channel"
    };

    readonly restrict: any = {
        specific: [RestrictGroup.ServerModerator]
    };

    public async executed(x: CommandContext): Promise<IAction<any> | null> {
        // TODO: Check if the send message failed and display error, and check if embeds + files can be sent.
        if (x.msg.channel.type === "text") {
            const channel: TextChannel = x.msg.channel as TextChannel;
            const permissions: Permissions | null = await channel.permissionsFor(x.msg.guild.me);

            let canEmbed: boolean = x.msg.guild.me.hasPermission("EMBED_LINKS");

            if (permissions !== null) {
                canEmbed = permissions.hasPermission("EMBED_LINKS");
            }

            if (canEmbed) {
                return {
                    type: ActionType.OkEmbed,
    
                    args: {
                        message: "I can send messages in this channel",
                        channelId: x.msg.channel.id,
                        requester: x.sender.username,
                        avatarUrl: x.sender.avatarURL
                    }
                };
            }
            else {
                return {
                    type: ActionType.Message,
    
                    args: {
                        message: "I'm missing the `EMBED_LINKS` permission required for embeds",
                        channelId: x.msg.channel.id
                    }
                };
            }
        }
        else if (x.msg.channel.type === "dm") {
            return {
                type: ActionType.Message,

                args: {
                    message: "I can send messages to you",
                    userId: x.sender.id
                }
            } as IAction<IPrivateMessageActionArgs>;
        }

        return null;
    }
};
