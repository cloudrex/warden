import {Collection, DMChannel, GuildMember, Invite, Message, RichEmbed, Role, Snowflake, TextChannel} from "discord.js";
import WardenAPI from "../core/warden-api";
import {CommandParser, DiscordEvent, Log, Patterns, Service, Utils} from "@cloudrex/forge";
import Mongo, {ModerationActionType} from "../database/mongo-database";
import Messages from "../core/messages";
import MemberConfig from "../core/member-config";
import {config} from "../app";

const conflictingBots: Snowflake[] = [
    "155149108183695360", // Dyno#3861,
    "268597426619809802", // Link#7233
    "159985870458322944", // MEE6#4876,
    "240254129333731328", // Vortex#8540,
    "434432910947385354", // Inspector#8221,
    "381949722157514752", // Warden#1062,
    "465148198403571722" // peepoCop#8395
];

let muteLeavers: Snowflake[] = [];

export default class ProtectionService extends Service {
    readonly meta = {
        name: "protection",
        description: "Autonomous server protection and moderation"
    };

    private async handleMessage(message: Message): Promise<void> {
        // Ignore DMs
        if (!message.guild || message.channel.type !== "text") {
            return;
        }

        // Ignore if bot doesn't have moderation powers
        if (!Utils.hasModerationPowers(message.guild.me)) {
            return;
        }

        let tracking: boolean | null = await MemberConfig.get(message.author.id, "tracking") as boolean | null;

        tracking = tracking === null ? true : tracking;

        // Log the message into the database
        if (config.globalTracking && tracking) {
            await Messages.add({
                authorTag: message.author.tag,
                authorId: message.author.id,
                channelId: message.channel.id,
                message: message.content,
                messageId: message.id,
                time: message.createdTimestamp,
                guildId: message.guild.id
            });
        }

        if (!this.api) {
            Log.warn("[Service:Protection] API provided is undefined or missing; Refusing to handle message");

            return;
        }

        const api: WardenAPI = this.api as WardenAPI;

        await this.handleInviteProtection(message, api);

        // Ignore owner and self
        if (message.author.id === this.bot.owner || message.author.id === this.bot.client.user.id) {
            return;
        }

        // Delete messages containing specific links/domains/websites
        await this.handleLinkProtection(message, api);

        if (message.content.length > 300 && message.content.split(" ").length < 15 && message.deletable) {
            await message.reply("Sorry pal, your message is way too large");
            await message.delete();
        }
        // TODO:
        /* else if (message.member.roles.has(this.api.roles.muted) && message.deletable) {
            await message.delete();
        } */
        // Mass mentions
        else {
            const mentions: Collection<Snowflake, GuildMember> = message.mentions.members;

            if (mentions && mentions.size > 0) {
                const mentionedUsers: GuildMember[] = mentions.array();

                if (mentionedUsers.length > 4) {
                    // Mute the user
                    // TODO: Use/implement in Consumer API v2
                    await api.executeAction(message.channel as TextChannel, {
                        member: message.member,
                        moderator: message.guild.me,
                        reason: "Mass mentions",
                        type: ModerationActionType.Mute
                    });

                    if (message.deletable) {
                        await message.delete();
                    }

                    const response: Message = await message.reply("You have been automatically muted until further notice for mass pinging.") as Message;

                    if (response) {
                        await response.delete(8000);
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
    }

    private async handleLinkProtection(msg: Message, api: WardenAPI): Promise<boolean> {
        if (/https?:\/\/twitch.tv/gm.test(msg.content) && msg.deletable) {
            await msg.delete();

            return true;
        }

        return false;
    }

    private async handleInviteProtection(message: Message, api: WardenAPI): Promise<void> {
        if (config.inviteProtection && Patterns.invite.test(message.content)) {
            const matches: RegExpMatchArray | null = message.content.match(Patterns.invite);

            if (matches !== null) {
                for (let i: number = 0; i < matches.length; i++) {
                    try {
                        const invite: Invite = await this.bot.client.fetchInvite(matches[i]);

                        if (invite) {
                            if (invite.guild.id !== message.guild.id) {
                                // TODO: Disabled because somehow it's interfering
                                if (message.deletable) {
                                    // TODO: Will it affect future checks/actions if the message is deleted?
                                    // TODO: What is if ALSO triggers other actions?
                                    await message.delete();
                                }

                                await message.reply("Invites to different guilds are not allowed.");

                                // TODO: As evidence maybe just provide the invite code?
                                await api.executeAction(message.channel as TextChannel, {
                                    type: ModerationActionType.Warn,
                                    moderator: message.guild.me,
                                    reason: "Posted an invite link to a different server",
                                    member: message.member
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
    }

    private handleMessageDeleted(message: Message): void {
        // Ignore DMs
        if (!message.guild || message.channel.type !== "text") {
            return;
        }

        // Save deleted messages for snipe command
        // TODO: Temporary hotfix
        if (CommandParser.getCommandBase(message.content, this.bot.settings.general.prefixes) === "snipe") {
            return;
        }

        this.api.deletedMessages.set(message.channel.id, message);

        // Delete the saved message after 30 minutes
        setTimeout(() => {
            this.api.deletedMessages.delete(message.channel.id);
        }, 1800000);
    }

    private handleGuildMemberLeft(member: GuildMember): void {
        // Prevent members from avoiding roles
        if (member.roles.has(config.roleMuted)) {
            muteLeavers.push(member.id);
        }
    }

    private async handleAdsOnName(member: GuildMember): Promise<boolean> {
        if (config.banAdsOnName && Patterns.invite.test(member.user.username)) {
            await this.api.executeAction(Utils.findDefaultChannel(member.guild), {
                type: ModerationActionType.Ban,
                reason: "Advertising on username",
                member,
                moderator: member.guild.me
            });

            return false;
        }

        return false;
    }

    private async handlePersistentRoles(member: GuildMember): Promise<boolean> {
        if (config.persistentRoles && muteLeavers.includes(member.id)) {
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

                return false;
            }

            // TODO: Use a central resource for getting reasons, (because include "Automatic" prefix)
            await member.addRole(this.api.roles.muted, "Possible attempt to avoid moderation by rejoining");

            return true;
        }

        return false;
    }

    private async handleGuildMemberJoined(member: GuildMember): Promise<void> {
        if (!await this.handleAdsOnName(member)) {
            await this.handlePersistentRoles(member);
        }
    }

    private async handleConflictingBots(old: GuildMember, updated: GuildMember): Promise<boolean> {
        // Conflicting Bots
        if (updated.user.id === this.bot.client.user.id && Utils.hasModerationPowers(updated) && !Utils.hasModerationPowers(old)) {
            const conflictsFound: GuildMember[] = [];

            for (let i = 0; i < conflictingBots.length; i++) {
                if (updated.guild.members.has(conflictingBots[i]) && Utils.hasModerationPowers(updated.guild.member(conflictingBots[i]))) {
                    conflictsFound.push(updated.guild.member(conflictingBots[i]));
                }
            }

            if (conflictsFound.length > 0) {
                const channel: TextChannel | null = Utils.findDefaultChannel(updated.guild);

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

                return true;
            }
        }

        return false;
    }

    private async handleAntiHoisting(old: GuildMember, updated: GuildMember): Promise<boolean> {
        // Anti-Hoisting
        // TODO: Load from guild config instead of being hardcoded
        const antiHoisting = config.antiHoisting;

        if (!antiHoisting) {
            return false;
        }

        if (!this.api.getGuild().me.hasPermission("MANAGE_NICKNAMES")) {
            Log.warn("[Protection:guildMemberUpdate] Cannot perform anti-hoisting protection without MANAGE_NICKNAMES permission");

            return false;
        }

        let name: string = updated.nickname || updated.user.username;
        let newName: string[] | string = [];

        for (let i = 0; i < name.length; i++) {
            if (/[a-z\s]/i.test(name[i])) {
                newName.push(name[i]);
            }
        }

        newName = newName.join("");

        if (name !== newName) {
            if (newName.trim() === "") {
                newName = "Unhoisted";
            }

            await updated.setNickname(newName, "Anti hoisting").catch((error: Error) => {
                Log.error(`[Protection:guildMemberUpdate] Unable to perform anti-hoisting on member ${updated.user.tag}: ${error.message}`);
            });
        }

        return true;
    }

    private async handleGuildMemberUpdated(old: GuildMember, updated: GuildMember): Promise<void> {
        await this.handleConflictingBots(old, updated);
        await this.handleAntiHoisting(old, updated);
    }

    public start(): void {
        if (this.bot.options.autoDeleteCommands) {
            Log.warn("[Protection.start] The autoDeleteCommands option is updatedly incompatible with the snipe command");
        }

        // Register listeners
        this.bot.client.on(DiscordEvent.Message, this.handleMessage.bind(this));
        this.bot.client.on(DiscordEvent.MessageDeleted, this.handleMessageDeleted.bind(this));
        this.bot.client.on(DiscordEvent.GuildMemberLeft, this.handleGuildMemberLeft.bind(this));
        this.bot.client.on(DiscordEvent.GuildMemberJoined, this.handleGuildMemberJoined.bind(this));
        this.bot.client.on(DiscordEvent.GuildMemberUpdated, this.handleGuildMemberUpdated.bind(this));
    }

    readonly canStart = (): boolean => {
        const databaseAvailable: boolean = Mongo.available;

        if (!databaseAvailable) {
            Log.warn("[:ProtectionService.canStart] Database not available, Protection service not starting");
        }

        return databaseAvailable;
    };

    /**
     * @param {GuildMember} member
     * @return {boolean} Whether the member was muted (if member was already muted, returns false)
     */
    private static mute(member: GuildMember): boolean {
        // TODO: Add error checking/catching
        // TODO: Shouldn't this be done from config?
        const role: Role = member.guild.roles.find("name", "Muted");

        if (!member.roles.has(role.id)) {
            member.addRole(role);

            return true;
        }

        return false;
    }

    public dispose(): void {
        muteLeavers = [];

        // Remove listeners
        this.bot.client.removeListener(DiscordEvent.Message, this.handleMessage);
        this.bot.client.removeListener(DiscordEvent.MessageDeleted, this.handleMessageDeleted);
        this.bot.client.removeListener(DiscordEvent.GuildMemberLeft, this.handleGuildMemberLeft);
        this.bot.client.removeListener(DiscordEvent.GuildMemberJoined, this.handleGuildMemberJoined);
        this.bot.client.removeListener(DiscordEvent.GuildMemberUpdated, this.handleGuildMemberUpdated);
    }
}
