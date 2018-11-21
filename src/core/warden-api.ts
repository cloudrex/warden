import {Guild, Message, RichEmbed, Snowflake, TextChannel, ColorResolvable, User} from "discord.js";
import {Bot, Log, Utils, CommandContext} from "@cloudrex/forge";
import Mongo, {IDbModAction, IModAction, ModActionType} from "../database/mongo-database";
import {BadWords, RacialSlurs} from "./constants";
import {config} from "../app";
import {DatabaseGuildConfig} from "../database/guild-config";
import Convert from "./convert";

export type MemberConfigType = "tracking";

const modActionTypeStrings: any = {
    [ModActionType.Ban]: "Banned",
    [ModActionType.BanId]: "Banned",
    [ModActionType.Kick]: "Kicked",
    [ModActionType.Mute]: "Muted",
    [ModActionType.Softban]: "Softbanned",
    [ModActionType.Test]: "Test",
    [ModActionType.Unban]: "Unbanned",
    [ModActionType.Unmute]: "Unmuted",
    [ModActionType.Warn]: "Warned"
};

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

export type IDmReportOptions = {
    readonly type: ModActionType;
    readonly reason: string;
    readonly color: ColorResolvable;
    readonly time: number;
    readonly end?: number;
    readonly guildName: string;
}

export default class WardenAPI {
    public readonly deletedMessages: Map<Snowflake, Message>;

    private readonly bot: Bot;

    /**
     * @param {WardenApiOptions} options
     */
    constructor(bot: Bot) {
        this.bot = bot;
        this.deletedMessages = new Map<Snowflake, Message>();
    }

    /**
     * @param {TextChannel} channel
     * @param {IModAction} rawAction
     * @return {Promise<void>}
     */
    public async executeAction(channel: TextChannel, rawAction: IModAction): Promise<void> {
        const action: IModAction = Object.assign({}, rawAction);
        const automatic: boolean = action.moderator.id === this.bot.client.user.id;

        (action.time as any) = Date.now();

        const embed: RichEmbed | null = WardenAPI.createModerationActionEmbed(Convert.toDatabaseModerationAction(null, action, automatic), automatic);

        let reportOptions: Partial<IDmReportOptions> | null = null;

        switch (action.type) {
            case ModActionType.Warn: {
                reportOptions = {
                    color: "GOLD"
                };

                // TODO

                break;
            }

            case ModActionType.Mute: {
                reportOptions = {
                    color: "PURPLE"
                };

                // TODO

                break;
            }

            case ModActionType.Ban: {
                reportOptions = {
                    color: "RED"
                };

                if (action.member.bannable) {
                    await action.member.ban({
                        reason: `${action.moderator.user.tag}: ${action.reason}`
                    });
                }
                else {
                    Log.warn("[WardenAPI.executeAction] Expecting member to be bannable");
                }

                break;
            }

            default: {
                throw new Error(`[WardenAPI.executeAction] Invalid or unknown moderation action type: ${rawAction.type}`);
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

        reportOptions = {
            ...reportOptions,
            type: action.type,
            time: Date.now(),
            guildName: action.moderator.guild.name,
            reason: action.reason,
            end: action.end
        };

        // Report to the violator
        await this.sendDmReport(action.member.user, WardenAPI.createDmReport(reportOptions as IDmReportOptions));

        // Send action log message
        const sent: Message = await (await channel.guild.channels.get(modLogChannel) as TextChannel).send(embed) as Message;

        await sent.edit(embed.setFooter(`Case ID: ${sent.id} • ${embed.footer.text}`, embed.footer.icon_url));
        await WardenAPI.saveModerationAction(action, sent.id, this.bot && action.moderator.id === this.bot.client.user.id);
    }

    private async sendDmReport(user: User, report: RichEmbed): Promise<void> {
        await (await user.createDM()).send(report);
    }

    /**
     * @param {IModAction} action
     * @param {Snowflake} caseId
     * @return {Promise<void>}
     */
    private static async saveModerationAction(action: IModAction, caseId: Snowflake, automatic: boolean): Promise<void> {
        await WardenAPI.saveDatabaseModerationAction(Convert.toDatabaseModerationAction(caseId, action, automatic));
    }

    public static async saveDatabaseModerationAction(action: IDbModAction): Promise<void> {
        await Mongo.collections.moderationActions.insertOne(action);
    }

    public static async retrieveModerationAction(caseId: Snowflake): Promise<IDbModAction | null> {
        return await Mongo.collections.moderationActions.findOne({
            id: caseId
        }) || null;
    }

    // TODO: Isn't automatic already determined & contained in 'action'?
    public static createModerationActionEmbed(action: IDbModAction, automatic: boolean): RichEmbed | null {
        switch (action.type) {
            case ModActionType.Ban: {
                return new RichEmbed()
                    .setTitle("Member Banned")
                    .addField("Member", `<@${action.memberId}> (${action.memberTag})`)
                    .addField("Reason", action.reason)
                    .addField("Moderator", `<@${action.moderatorId}> (${action.moderatorTag})`)
                    .setThumbnail(action.evidence ? action.evidence : "")
                    .setFooter(`Banned by ${action.moderatorUsername}`, action.moderatorAvatarUrl)
                    .setColor("RED");
            }

            case ModActionType.Warn: {
                return new RichEmbed()
                    .setTitle("Member Warned")
                    .addField("Member", `<@${action.memberId}> (${action.memberTag})`)
                    .addField("Reason", action.reason)
                    .addField("Moderator", `<@${action.moderatorId}> (${action.moderatorTag})`)
                    .setThumbnail(action.evidence ? action.evidence : "")
                    .setFooter(automatic ? "Automatically warned" : `Warned by ${action.moderatorUsername}`, action.moderatorAvatarUrl)
                    .setColor("PURPLE");
            }

            case ModActionType.Kick: {
                return new RichEmbed()
                    .setTitle("Member Kicked")
                    .addField("Member", `<@${action.memberId}> (${action.memberTag})`)
                    .addField("Reason", action.reason)
                    .addField("Moderator", `<@${action.moderatorId}> (${action.moderatorTag})`)
                    .setThumbnail(action.evidence ? action.evidence : "")
                    .setFooter(`Kicked by ${action.moderatorUsername}`, action.moderatorAvatarUrl)
                    .setColor("GOLD");
            }

            case ModActionType.Mute: {
                return new RichEmbed()
                        .setTitle("Member Muted")
                        .addField("Member", `<@${action.memberId}> (${action.memberTag})`)
                        .addField("Reason", action.reason)
                        .addField("Moderator", `<@${action.moderatorId}> (${action.moderatorTag})`)
                        .setThumbnail(action.evidence ? action.evidence : "")
                        .setFooter(`Muted by ${action.moderatorUsername}`, action.moderatorAvatarUrl)
                        .setColor("BLUE");
            }

            case ModActionType.Unban: {
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

    public static createDmReport(options: IDmReportOptions): RichEmbed {
        const result: RichEmbed = new RichEmbed()
            .setColor(options.color)
            .setFooter("If you think this is wrong, please contact a staff member")
            .addField("Guild", options.guildName)
            .addField("Action", WardenAPI.getModActionString(options.type))
            .addField("Reason", options.reason)
            .setDescription("A moderation action has been applied to you");

        if (options.end !== undefined) {
            result.addField("Time", Utils.timeAgo(options.time + options.end));
        }

        return result;
    }
    
    public static getModActionString(type: ModActionType): string {
        if (!Object.keys(modActionTypeStrings).includes(type.toString())) {
            throw new Error(`[WardenAPI.getModActionString] Moderation action string is not set for type '${type}'`);
        }

        return modActionTypeStrings[type];
    }

    public static extractActionFromContext(context: CommandContext): IModAction {
        // TODO:

        return {} as any;
    }
}
