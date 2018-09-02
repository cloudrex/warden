import {Collection, DMChannel, GuildMember, Invite, Message, RichEmbed, Snowflake, TextChannel} from "discord.js";
import WardenApi, {WardenAPI} from "../warden-api";
import {Bot, CommandParser, Log, Service} from "discord-anvil";
import Patterns from "discord-anvil/dist/core/patterns";
import Utils from "discord-anvil/dist/core/utils";

const conflictingBots: Array<Snowflake> = [
    "155149108183695360" // Dyno#3861
];

const muteLeavers: Array<Snowflake> = [];

export default class Protection extends Service {
    readonly meta = {
        name: "protection",
        description: "Unattended protection and moderation"
    };

    public start(): void {
        this.bot.client.on("message", async (message: Message) => {
            // Log the message into the database
            this.api.db.messages.insert({
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
                            const invite: Invite = await this.bot.client.fetchInvite(matches[i]);

                            if (invite) {
                                if (invite.guild.id !== message.guild.id) {
                                    if (message.deletable) {
                                        // TODO: Will it affect future checks/actions if the message is deleted?
                                        // TODO: What is if ALSO triggers other actions?
                                        await message.delete();
                                    }

                                    message.reply("Invites to different guilds are not allowed.");

                                    let evidence: string = `*${message.content}*`;

                                    if (evidence.length > 200) {
                                        evidence = evidence.substring(0, 200) + " ...";
                                    }

                                    await this.api.warn({
                                        message: message,
                                        moderator: this.bot.client.user,
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
            if (message.author.id === this.bot.owner || message.author.id === this.bot.client.user.id) {
                return;
            }

            if (message.content.length > 300 && message.content.split(" ").length < 15 && message.deletable) {
                await message.reply("Your message is too large.");
                await message.delete();
            }
            else if (message.member.roles.has(this.api.roles.muted) && message.deletable) {
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

                        const response: Message = await message.reply("You have been automatically muted until further notice for mass pinging.") as Message;

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
                await this.api.flagMessage(message, suspectedViolation);
            }

            if (message && message.mentions && message.mentions.members) {
                message.mentions.members.array().map(async (member: GuildMember) => {
                    if (!message.author.bot && member.id !== message.author.id && member.roles.map((role) => role.id).includes("458827341196427265")) {
                        const response: Message = await message.reply("Please refrain from pinging this person under any circumstances. He/she is either a partner or special guest and should not be pinged.") as Message;

                        if (response) {
                            response.delete(8000);
                        }

                        await this.api.warn({
                            user: message.member,
                            reason: "Pinging a 'Dont Ping' member",
                            moderator: this.bot.client.user,
                            message: message
                        });
                    }
                });
            }
        });

        // Save deleted messages for snipe command
        this.bot.client.on("messageDelete", (message: Message) => {
            // TODO: Temporary hotfix
            if (CommandParser.getCommandBase(message.content, this.bot.settings.general.prefixes) === "snipe") {
                return;
            }

            WardenApi.deletedMessages[message.channel.id] = message;

            // Delete the saved message after 30 minutes
            setTimeout(() => {
                delete WardenApi.deletedMessages[message.channel.id];
            }, 1800000);
        });

        // Prevent members from role avoiding
        this.bot.client.on("guildMemberRemove", (member: GuildMember) => {
            if (member.roles.has(this.api.roles.muted)) {
                muteLeavers.push(member.id);
            }
        });

        this.bot.client.on("guildMemberAdd", async (member: GuildMember) => {
            if (muteLeavers.includes(member.id)) {
                const dm: DMChannel = await member.createDM();

                dm.send(new RichEmbed()
                    .setColor("RED")
                    .setDescription(":zap: Beep Boop! Attempting to avoid moderation by rejoining may result in a permanent ban. You may ignore this message if this is not the case.")
                    .setFooter("Generated by Warden's autonomous protection system"));

                const owner: GuildMember | null = this.api.getOwner();

                if (owner) {
                    const ownerDM: DMChannel = await owner.createDM();

                    ownerDM.send(new RichEmbed()
                        .setColor("RED")
                        .setDescription(`<@${member.id}> (${member.user.tag}) may have attempted to avoid moderation actions by rejoining.`));
                }
                else {
                    Log.warn("[Protection:guildMemberAdd] Owner member was not found in the guild");
                }

                if (member.roles.has(this.api.roles.muted)) {
                    Log.warn("[Protection:guildMemberAdd] Looks like someone got there before me! Another bot provides moderation dodging protection, which may cause problems. You can identify the bot by checking audit logs.");

                    return;
                }

                await member.addRole(this.api.roles.muted, "Possible attempt to avoid moderation by rejoining");
            }
        });

        this.bot.client.on("guildMemberUpdate", async (old: GuildMember, current: GuildMember) => {
            // Conflicting Bots
            if (current.user.id === this.bot.client.user.id) {
                if (Utils.hasModerationPowers(current) && !Utils.hasModerationPowers(old)) {
                    const conflictsFound: Array<GuildMember> = [];

                    for (let i = 0; i < conflictingBots.length; i++) {
                        if (current.guild.members.has(conflictingBots[i]) && Utils.hasModerationPowers(current.guild.member(conflictingBots[i]))) {
                            conflictsFound.push(current.guild.member(conflictingBots[i]));
                        }
                    }

                    if (conflictsFound.length > 0) {
                        const channel: TextChannel | null = Utils.findDefaultChannel(current.guild);

                        if (channel) {
                            let description = ":white_check_mark: I've been granted moderation powers but there's a problem -- I've detected conflicting bot(s) which may present problems.\n";

                            for (let i = 0; i < conflictsFound.length; i++) {
                                description += `\n:warning: <@${conflictsFound[i].id}> (${conflictsFound[i].user.tag})`;
                            }

                            channel.send(new RichEmbed()
                                .setColor("GREEN")
                                .setDescription(description)
                                .setFooter("This message won't be shown again"));
                        }
                        else {
                            Log.warn("[Protection:guildMemberUpdate] Could not find a default/general channel");

                            // TODO: Last resort: DM guild owner
                        }
                    }
                }
            }

            // Anti-Hoisting
            const antiHoisting = true;

            if (!antiHoisting) {
                return;
            }

            if (!this.api.getGuild().me.hasPermission("MANAGE_NICKNAMES")) {
                Log.warn("[Protection:guildMemberUpdate] Cannot perform anti-hoisting protection without MANAGE_NICKNAMES permission");

                return;
            }

            let name: string = current.nickname || current.user.username;
            let newName: Array<string> | string = [];

            for (let i = 0; i < name.length; i++) {
                if (/[a-z]/i.test(name[i])) {
                    newName.push(name[i]);
                }
            }

            newName = newName.join("");

            if (name !== newName) {
                if (newName.trim() === "") {
                    newName = "Unhoisted";
                }

                await current.setNickname(newName, "Anti hoisting").catch((error: Error) => {
                    Log.error(`[Protection:guildMemberUpdate] Unable to perform anti-hoisting on member ${current.user.tag}: ${error.message}`);
                });
            }
        });

        if (this.bot.options.autoDeleteCommands) {
            Log.warn("The autoDeleteCommands option is currently incompatible with the snipe command");
        }
    }

    private static mute(member: GuildMember): void {
        member.addRole(member.guild.roles.find("name", "Muted"));
    }
}