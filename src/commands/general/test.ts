import {CommandType} from "./help";
import {TextChannel, Permissions} from "discord.js";
import {Name, Description, Constraint, Context} from "d.mix";

@Name("test")
@Description("Test whether I can send messages in this channel")
@Constraint.Specific(RestrictGroup.ServerModerator)
export default class extends Command {
    readonly type = CommandType.Utility;

    public async run($: Context): Promise<IAction<any> | null> {
        // TODO: Check if the send message failed and display error, and check if embeds + files can be sent.
        if ($.msg.channel.type === "text") {
            const channel: TextChannel = $.msg.channel as TextChannel;
            const permissions: Permissions | null = await channel.permissionsFor($.msg.guild.me);

            let canEmbed: boolean = $.msg.guild.me.hasPermission("EMBED_LINKS");

            if (permissions !== null) {
                canEmbed = permissions.hasPermission("EMBED_LINKS");
            }

            if (canEmbed) {
                return {
                    type: ActionType.OkEmbed,

                    args: {
                        message: "I can send messages in this channel",
                        channelId: $.msg.channel.id,
                        requester: $.sender.username,
                        avatarUrl: $.sender.avatarURL
                    }
                };
            }
            else {
                return {
                    type: ActionType.Message,

                    args: {
                        message: "I'm missing the `EMBED_LINKS` permission required for embeds",
                        channelId: $.msg.channel.id
                    }
                };
            }
        }
        else if ($.msg.channel.type === "dm") {
            return {
                type: ActionType.Message,

                args: {
                    message: "I can send messages to you",
                    userId: $.sender.id
                }
            } as IAction<IPrivateMessageActionArgs>;
        }

        return null;
    }
};
