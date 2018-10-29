import {Guild, GuildMember, Message, RichEmbed, Snowflake, TextChannel} from "discord.js";
import {Bot, Log} from "@cloudrex/forge";

import Mongo, {IDatabaseModerationAction, IModerationAction, ModerationActionType} from "../database/mongo-database";

import {BadWords, RacialSlurs} from "./constants";
import {config} from "../app";
import {DatabaseGuildConfig} from "../database/guild-config";
import Convert from "./convert";

export type MemberConfigType = "tracking";

export enum CaseType {
    Warn,
    Mute,
    Kick,
    Ban
}

const SuspectedViolation: any = {
    Long: "Long",
    ExcessiveProfanity: "Excessive Profanity",
    Sexism: "Sexism",
    Spamming: "Spamming",
    MassMentions: "Mass Mentions",
    MultipleNewLines: "Multiple New Lines",
    Advertising: "Advertising",
    RacialSlurs: "Racial Slurs",
    None: "None"
};

export interface ConsumerApiChannels {
    readonly modLog: Snowflake;
    readonly suggestions: Snowflake;
    readonly review: Snowflake;
    readonly votes: Snowflake;
    readonly decisions: Snowflake;
    readonly changes: Snowflake;
}

export interface ConsumerApiResolvedChannels {
    readonly modLog: TextChannel;
    readonly suggestions: TextChannel;
    readonly review: TextChannel;
}

export interface ConsumerAPIRoles {
    readonly muted: Snowflake;
}

export interface WardenApiOptions {
    readonly bot: Bot;
    readonly guild: Snowflake;
    readonly roles: ConsumerAPIRoles;
    readonly channels: ConsumerApiChannels;
}

export default class WardenAPI {
    public readonly deletedMessages: Map<Snowflake, Message>;

    private readonly bot: Bot;

    public caseCounter: number;

    // TODO: Type
    private channels?: ConsumerApiResolvedChannels;

    /**
     * @param {WardenApiOptions} options
     */
    constructor(bot: Bot) {
        this.bot = bot;
        this.deletedMessages = new Map<Snowflake, Message>();
        this.caseCounter = 0;
    }

    public setup(): this {
        // Setup channels
        this.channels = {
            modLog: this.getChannel(config.channelModLog),
            suggestions: this.getChannel(config.channelSuggestions),
            review: this.getChannel(config.channelReview)
        };

        this.caseCounter = 0;// TODO await this.getCaseCounter();

        return this;
    }

    /**
     * @param {TextChannel} channel
     * @param {IModerationAction} action
     * @return {Promise<void>}
     */
    public async executeAction(channel: TextChannel, action: IModerationAction): Promise<void> {
        const reason: string = `${action.moderator.user.tag} => ${action.reason}`;
        const automatic: boolean = action.moderator.id === this.bot.client.user.id;

        const embed: RichEmbed | null = WardenAPI.createModerationActionEmbed(Convert.toDatabaseModerationAction(null, action, automatic), automatic);

        switch (action.type) {
            case ModerationActionType.Warn: {
                const warnDM: string = automatic ? `You were automatically warned for **${action.reason}**` : `You were warned by <@${action.moderator.id}> (${action.moderator.user.username}) for **${action.reason}**`;

                try {
                    await (await action.member.createDM()).send(new RichEmbed()
                        .setDescription(warnDM)
                        .setColor("PURPLE"));
                    }
                catch (e) {}

                break;
            }

            case ModerationActionType.Mute: {
                await action.member.addRole(action.member.guild.roles.find("name", "Muted"), reason);

                try {
                    (await action.member.createDM()).send(new RichEmbed()
                        .setDescription(`You were muted by <@${action.moderator.id}> (${action.moderator.user.username}) for **${action.reason}**`)
                        .setColor("BLUE"));
                }
                catch (e) {}

                break;
            }

            case ModerationActionType.Ban: {
                try {
                    await (await action.member.createDM()).send(new RichEmbed()
                        .setDescription(`You were banned from **${action.member.guild.name}** by <@${action.moderator.id}> (${action.moderator.user.username}) for **${action.reason}**`)
                        .setColor("RED"))
                }
                catch (e) {}

                await action.member.ban({
                    days: 1,
                    reason
                });

                break;
            }

            case ModerationActionType.Kick: {
                try {
                    await (await action.member.createDM()).send(new RichEmbed()
                        .setDescription(`You were kicked from **${action.member.guild.name}** by <@${action.moderator.id}> (${action.moderator.user.username}) for **${action.reason}**`)
                        .setColor("GOLD"))
                }
                catch (e) {}

                await action.member.kick(reason);

                break;
            }

            case ModerationActionType.Unban: {
                await action.member.guild.unban(action.member.id, reason);

                try {
                    await (await action.member.createDM()).send(new RichEmbed()
                        .setDescription(`You have been pardoned in **${action.member.guild.name}** by <@${action.moderator.id}> (${action.moderator.user.username}) because **${action.reason}**`)
                        .setColor("GREEN"))
                }
                catch (e) {}

                break;
            }

            default: {
                Log.error(`[WardenAPI.executeAction] Unexpected action type: '${action.type}'`);

                return;
            }
        }

        if (embed === null || embed.footer === undefined || embed.footer.text === undefined) {
            Log.error("[WardenAPI.executeAction] Expecting embed and footer");

            return;
        }

        const modLogChannel: Snowflake | null = (await DatabaseGuildConfig.getOrDefault(channel.guild.id)).modLogChannel || null;

        // TODO: Should be auto set for in case of emergencies, maybe auto-search for "mod-log" channel?
        if (!modLogChannel) {
            await channel.send("No channel is configured for modLog, use the `setchannel` command to set it");

            return;
        }

        const sent: Message = await (await channel.guild.channels.get(modLogChannel) as TextChannel).send(embed) as Message;

        await sent.edit(embed.setFooter(`Case ID: ${sent.id} • ${embed.footer.text}`, embed.footer.icon_url));
        await WardenAPI.saveModerationAction(action, sent.id, this.bot && action.moderator.id === this.bot.client.user.id);
    }

    /**
     * @param {IModerationAction} action
     * @param {Snowflake} caseId
     * @return {Promise<void>}
     */
    private static async saveModerationAction(action: IModerationAction, caseId: Snowflake, automatic: boolean): Promise<void> {
        await WardenAPI.saveDatabaseModerationAction(Convert.toDatabaseModerationAction(caseId, action, automatic));
    }

    public static async saveDatabaseModerationAction(action: IDatabaseModerationAction): Promise<void> {
        await Mongo.collections.moderationActions.insertOne(action);
    }

    public static async retrieveModerationAction(caseId: Snowflake): Promise<IDatabaseModerationAction | null> {
        return await Mongo.collections.moderationActions.findOne({
            id: caseId
        }) || null;
    }

    // TODO: Isn't automatic already determined & contained in 'action'?
    public static createModerationActionEmbed(action: IDatabaseModerationAction, automatic: boolean): RichEmbed | null {
        switch (action.type) {
            case ModerationActionType.Ban: {
                return new RichEmbed()
                    .setTitle("Member Banned")
                    .addField("Member", `<@${action.memberId}> (${action.memberTag})`)
                    .addField("Reason", action.reason)
                    .addField("Moderator", `<@${action.moderatorId}> (${action.moderatorTag})`)
                    .setThumbnail(action.evidence ? action.evidence : "")
                    .setFooter(`Banned by ${action.moderatorUsername}`, action.moderatorAvatarUrl)
                    .setColor("RED");
            }

            case ModerationActionType.Warn: {
                return new RichEmbed()
                    .setTitle("Member Warned")
                    .addField("Member", `<@${action.memberId}> (${action.memberTag})`)
                    .addField("Reason", action.reason)
                    .addField("Moderator", `<@${action.moderatorId}> (${action.moderatorTag})`)
                    .setThumbnail(action.evidence ? action.evidence : "")
                    .setFooter(automatic ? "Automatically warned" : `Warned by ${action.moderatorUsername}`, action.moderatorAvatarUrl)
                    .setColor("PURPLE");
            }

            case ModerationActionType.Kick: {
                return new RichEmbed()
                    .setTitle("Member Kicked")
                    .addField("Member", `<@${action.memberId}> (${action.memberTag})`)
                    .addField("Reason", action.reason)
                    .addField("Moderator", `<@${action.moderatorId}> (${action.moderatorTag})`)
                    .setThumbnail(action.evidence ? action.evidence : "")
                    .setFooter(`Kicked by ${action.moderatorUsername}`, action.moderatorAvatarUrl)
                    .setColor("GOLD");
            }

            case ModerationActionType.Mute: {
                return new RichEmbed()
                        .setTitle("Member Muted")
                        .addField("Member", `<@${action.memberId}> (${action.memberTag})`)
                        .addField("Reason", action.reason)
                        .addField("Moderator", `<@${action.moderatorId}> (${action.moderatorTag})`)
                        .setThumbnail(action.evidence ? action.evidence : "")
                        .setFooter(`Muted by ${action.moderatorUsername}`, action.moderatorAvatarUrl)
                        .setColor("BLUE");
            }

            case ModerationActionType.Unban: {
                return new RichEmbed()
                    .setTitle("Member Pardoned")
                    .addField("Member", `<@${action.memberId}> (${action.memberTag})`)
                    .addField("Reason", action.reason)
                    .addField("Moderator", `<@${action.moderatorId}> (${action.moderatorTag})`)
                    .setThumbnail(action.evidence ? action.evidence : "")
                    .setFooter(`Pardoned by ${action.moderatorUsername}`, action.moderatorAvatarUrl)
                    .setColor("GREEN");
            }
        }

        return null;
    }

    /**
     * @return {Guild}
     */
    public getGuild(): Guild {
        const guild: Guild | undefined = this.bot.client.guilds.get(config.guild);

        if (!guild) {
            throw new Error("[WardenAPI.getGuild] Expecting guild");
        }

        return guild;
    }

    /**
     * @param {Snowflake} id
     * @return {TextChannel}
     */
    public getChannel(id: Snowflake): TextChannel {
        const channel = this.getGuild().channels.get(id);

        if (!channel) {
            Log.throw("[WardenAPI.getChannel] Expecting channel");
        }
        // TODO: Verify that this check works
        else if (!(channel instanceof TextChannel)) {
            Log.throw("[WardenAPI.getChannel] Expecting channel type to be 'TextChannel'");
        }

        return <TextChannel>channel;
    }

    public getChannels(): ConsumerApiResolvedChannels {
        // TODO: Forcing
        return this.channels as ConsumerApiResolvedChannels;
    }

    /**
     * @return {GuildMember | null}
     */
    public getOwner(): GuildMember | null {
        if (!this.bot.owner) {
            return null;
        }

        return this.getGuild().member(this.bot.owner) || null;
    }

    /**
     * @param {string} suggestion
     * @param {GuildMember} author
     * @return {Promise<boolean>}
     */
    public async addSuggestion(suggestion: string, author: GuildMember): Promise<boolean> {
        if (!this.channels) {
            Log.throw("[WardenAPI.addSuggestion] Consumer API is not setup");

            return false;
        }

        const suggestionMessage: Message = <Message>(await this.channels.suggestions.send(new RichEmbed()
            .setFooter(`Suggested by ${author.user.username}`, author.user.avatarURL)
            .setDescription(suggestion)
            .setColor("GREEN")));

        if (suggestionMessage) {
            await suggestionMessage.react("⬆");
            await suggestionMessage.react("⬇");
        }

        return false;
    }

    /**
     * @todo Using ConsumerAPI
     * @param {Message} message
     * @return {string}
     */
    public static isMessageSuspicious(message: Message): string {
        if (message.content.length > 500) {
            return SuspectedViolation.Long;
        }
        else if (message.mentions.users.size > 3) {
            return SuspectedViolation.MassMentions;
        }
        else if (!message.author.bot && message.content.split("`").length < 6 && message.content.split("\n").length > 2) {
            return SuspectedViolation.MultipleNewLines;
        }
        else if (WardenAPI.countBadWords(message.content) > 2) {
            return SuspectedViolation.ExcessiveProfanity;
        }
        else if (WardenAPI.containsRacialSlurs(message.content)) {
            return SuspectedViolation.RacialSlurs;
        }

        // TODO: Add missing checks

        return SuspectedViolation.None;
    }

    /**
     * @param {Message} message
     * @param {string} suspectedViolation
     * @return {Promise<void>}
     */
    public async flagMessage(message: Message, suspectedViolation: string): Promise<void> {
        if (!this.channels) {
            Log.error("[WardenAPI.flagMessage] Expecting channels");

            return;
        }
        else if (!this.channels.review) {
            Log.error("[WardenAPI.flagMessage] Review channel does not exist, failed to flag message");

            return;
        }

        await this.channels.review.send(new RichEmbed()
            .setTitle("Suspicious Message")
            .addField("Sender", `<@${message.author.id}> (${message.author.username})`)
            .addField("Message", message.content)
            .addField("Channel", `<#${message.channel.id}>`)
            .addField("Reason", suspectedViolation)
            .addField("Message ID", message.id));

        return;
    }

    /**
     * @param {string} message The message to inspect
     * @return {number} The number of bad words found
     */
    public static countBadWords(message: string): number {
        let count = 0;

        for (let i = 0; i < BadWords.length; i++) {
            // TODO: Might need to clean regex to avoid Regexddos
            const matches = message.match(new RegExp(BadWords[i], "gi"));

            if (matches) {
                count += matches.length;
            }
        }

        return count;
    }

    /**
     * @param {string} message The message to inspect
     * @return {boolean} Whether the message contains racial slurs
     */
    public static containsRacialSlurs(message: string): boolean {
        for (let i = 0; i < RacialSlurs.length; i++) {
            if (message.toLowerCase().includes(RacialSlurs[i])) {
                return true;
            }
        }

        return false;
    }
}
