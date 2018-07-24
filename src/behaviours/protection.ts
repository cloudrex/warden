import {Collection, GuildMember, Message, Snowflake, DMChannel} from "discord.js";
import WardenApi, {WardenAPI} from "../warden-api";
import { Bot, CommandParser, Log, Behaviour } from "discord-anvil";

const muteLeavers: Array<Snowflake> = [];

export default class Protection extends Behaviour {
    readonly meta = {
        name: "protection",
        description: "Unattended protection and moderation"
    };

    public enabled(bot: Bot, api: WardenAPI): void {
        bot.client.on("message", async (message: Message) => {
            if (message.author.id !== bot.owner) {
                if (message.content.length > 300 && message.content.split(" ").length < 15 && message.deletable) {
                    await message.reply("Your message is too large.");
                    await message.delete();
                }
                else if (message.member.roles.has(api.roles.muted) && message.deletable) {
                    await message.delete();
                }
                else if (/https?:\/\/discord\.gg\/[a-zA-Z0-9]+/gi.test(message.content) || /https?:\/\/discordapp\.com\/invite\/[a-zA-Z0-9]+/gi.test(message.content)) {
                    if (message.deletable) {
                        await message.delete();
                    }

                    await message.reply("Discord server invites are not allowed in this server.");

                    // TODO: Warn
                }
                else {
                    const mentions: Collection<Snowflake, GuildMember> = message.mentions.members;

                    if (mentions && mentions.size > 0) {
                        const mentionedUsers: Array<GuildMember> = mentions.array();

                        if (mentionedUsers.length > 4 || mentionedUsers.length > 4 || mentionedUsers.length > 4) {
                            if (message.deletable) {
                                await message.delete();
                            }

                            // Mute the user
                            // TODO: Use/implement in Consumer API v2
                            Protection.mute(message.member);

                            const response: Message = <Message>(await message.reply("You have been automatically muted until further notice for mass pinging."));

                            if (response) {
                                response.delete(8000);
                            }
                        }
                    }
                }

                // TODO: What about if it has been taken action against?
                // TODO: Something around posting suspected violations giving uncaught missing permissions error
                const suspectedViolation: string = WardenAPI.isMessageSuspicious(message);

                if (suspectedViolation !== "None") {
                    await api.flagMessage(message, suspectedViolation);
                }

                if (message && message.mentions && message.mentions.members) {
                    message.mentions.members.array().map(async (member: GuildMember) => {
                        if (!message.author.bot && member.id !== message.author.id && member.roles.map((role) => role.id).includes("458827341196427265")) {
                            const response: Message = <Message>(await message.reply("Please refrain from pinging this person under any circumstances. He/she is either a partner or special guest and should not be pinged."));

                            if (response) {
                                response.delete(8000);
                            }

                            await api.warn({
                                user: message.member,
                                reason: "Pinging a 'Dont Ping' member",
                                moderator: message.guild.me.user,
                                message: message
                            });
                        }
                    });
                }
            }
        });

        // Save deleted messages for snipe command
        bot.client.on("messageDelete", (message: Message) => {
            // TODO: Temporary hotfix
            if (CommandParser.getCommandBase(message.content, bot.settings.general.prefixes) === "snipe") {
                return;
            }

            WardenApi.deletedMessages[message.channel.id] = message;

            // Delete the saved message after 30 minutes
            setTimeout(() => {
                delete WardenApi.deletedMessages[message.channel.id];
            }, 1800000);
        });

        // Prevent members from role avoiding
        bot.client.on("guildMemberRemove", (member: GuildMember) => {
            if (member.roles.has(api.roles.muted)) {
                muteLeavers.push(member.id);
            }
        });

        bot.client.on("guildMemberAdd", async (member: GuildMember) => {
            if (muteLeavers.includes(member.id)) {
                const dm: DMChannel = await member.createDM();

                dm.send("Attempting to avoid moderation by rejoining may result in a permanent ban.");
            }

            member.addRole(api.roles.muted, "Attempting to avoid moderation by rejoining");
        });

        if (bot.autoDeleteCommands) {
            Log.warn("The autoDeleteCommands option is currently incompatible with the snipe command");
        }
    }

    private static mute(member: GuildMember): void {
        member.addRole(member.guild.roles.find("name", "Muted"));
    }
}