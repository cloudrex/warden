import {Collection, DMChannel, GuildMember, Invite, Message, RichEmbed, Snowflake} from "discord.js";
import WardenApi, {WardenAPI} from "../warden-api";
import {Service, Bot, CommandParser, Log} from "discord-anvil";
import Patterns from "discord-anvil/dist/core/patterns";

const muteLeavers: Array<Snowflake> = [];

export default class Protection extends Service {
    readonly meta = {
        name: "protection",
        description: "Unattended protection and moderation"
    };

    public enabled(bot: Bot, api: WardenAPI): void {
        bot.client.on("message", async (message: Message) => {
            // Log the message into the database
            api.db.messages.insert({
                author: message.author.id,
                authorTag: message.author.tag,
                channel: message.channel.id,
                deleted: false,
                id: message.id,
                text: message.content,
                time: message.createdTimestamp
            });

            if (Patterns.invite.test(message.content)) {
                const matches = message.content.match(Patterns.invite);

                if (matches !== null) {
                    for (let i = 0; i < matches.length; i++) {
                        try {
                            const invite: Invite = await bot.client.fetchInvite(matches[i]);

                            if (invite) {
                                if (invite.guild.id !== message.guild.id) {
                                    if (message.deletable) {
                                        // TODO: Will it affect future checks/actions if the message is deleted?
                                        // TODO: What is if ALSO triggers other actions?
                                        await message.delete();
                                    }

                                    message.reply("Invites to different guilds are not allowed.");

                                    let evidence: string = message.content;

                                    if (evidence.length > 200) {
                                        evidence = evidence.substring(0, 200) + " (Trimmed)";
                                    }

                                    await api.warn({
                                        message: message,
                                        moderator: bot.client.user,
                                        reason: "Posted an invite link to a different server",
                                        user: message.member,
                                        evidence: evidence
                                    });

                                    break;
                                }
                            }
                        }
                        catch (error) {
                            if (error.message !== "Unknown Invite") {
                                Log.warn(`[Protection:message] Unexpected error while fetching invite: ${error.message}`);
                            }
                        }
                    }
                }
            }

            // Ignore owner and self
            if (message.author.id === bot.owner || message.author.id === bot.client.user.id) {
                return;
            }

            if (message.content.length > 300 && message.content.split(" ").length < 15 && message.deletable) {
                await message.reply("Your message is too large.");
                await message.delete();
            }
            else if (message.member.roles.has(api.roles.muted) && message.deletable) {
                await message.delete();
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
                        const response: Message = await message.reply("Please refrain from pinging this person under any circumstances. He/she is either a partner or special guest and should not be pinged.") as Message;

                        if (response) {
                            response.delete(8000);
                        }

                        await api.warn({
                            user: message.member,
                            reason: "Pinging a 'Dont Ping' member",
                            moderator: bot.client.user,
                            message: message
                        });
                    }
                });
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

                dm.send(new RichEmbed()
                    .setColor("RED")
                    .setDescription(":zap: Beep Boop! Attempting to avoid moderation by rejoining may result in a permanent ban. You may ignore this message if this is not the case.")
                    .setFooter("Generated by Warden's autonomous protection system"));

                const owner: GuildMember | null = api.getOwner();

                if (owner) {
                    const ownerDM: DMChannel = await owner.createDM();

                    ownerDM.send(new RichEmbed()
                        .setColor("RED")
                        .setDescription(`<@${member.id}> (${member.user.tag}) may have attempted to avoid moderation actions by rejoining.`));
                }
                else {
                    Log.warn("[Protection:guildMemberAdd] Owner member was not found in the guild");
                }

                await member.addRole(api.roles.muted, "Possible attempt to avoid moderation by rejoining");
            }
        });

        if (bot.options.autoDeleteCommands) {
            Log.warn("The autoDeleteCommands option is currently incompatible with the snipe command");
        }
    }

    private static mute(member: GuildMember): void {
        member.addRole(member.guild.roles.find("name", "Muted"));
    }
}
