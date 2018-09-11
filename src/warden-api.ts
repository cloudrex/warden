import {StoredWarning} from "./commands/warnings";
import {Guild, GuildMember, Message, RichEmbed, Snowflake, TextChannel, User} from "discord.js";
import {Bot, DataProvider, JsonProvider, Log} from "discord-anvil";
import Mongo, {ModerationAction, ModerationActionType} from "./database/mongo-database";

const badWords: Array<string> = [
    "asshole",
    "fuck",
    "bitch",
    "shit",
    "slut",
    "whore",
    "anus",
    "dick",
    "bastard",
    "cunt",
    "pussy",
    "cock"
];

const racialSlurs: Array<string> = [
    "nigg",
    "blaxican",
    "faggot",
    "nibba"
];

export enum CaseType {
    Warn,
    Mute,
    Kick,
    Ban
}

export interface WarnOptions {
    readonly user: GuildMember;
    readonly moderator: User;
    readonly reason: string;
    readonly channel: any;
    readonly message: Message;
    readonly dataProvider?: DataProvider;
    readonly evidence?: string;
}

export interface WarnOptionsv2 {
    readonly user: GuildMember;
    readonly moderator: User;
    readonly reason: string;
    readonly message: Message;
    readonly evidence?: string;
}

export interface MuteOptions {
    readonly user: GuildMember;
    readonly moderator: User;
    readonly reason: string;
    readonly channel: any;
    readonly message: Message;
    readonly evidence?: string;
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

export interface CaseOptions {
    readonly member: GuildMember;
    readonly color: string;
    readonly reason: string;
    readonly moderator: User;
    readonly title: string;
    readonly evidence?: string;
}

export interface ConsumerAPIChannels {
    readonly modLog: Snowflake;
    readonly suggestions: Snowflake;
    readonly review: Snowflake;
    readonly votes: Snowflake;
    readonly decisions: Snowflake;
    readonly changes: Snowflake;
}

export interface ConsumerAPIResolvedChannels {
    readonly modLog: TextChannel;
    readonly suggestions: TextChannel;
    readonly review: TextChannel;
    readonly votes: TextChannel;
    readonly decisions: TextChannel;
    readonly changes: TextChannel;
}

export interface ConsumerAPIRoles {
    readonly muted: Snowflake;
}

export interface WardenAPIOptions {
    readonly bot: Bot;
    readonly databasePath: string;
    readonly guild: Snowflake;
    readonly roles: ConsumerAPIRoles;
    readonly channels: ConsumerAPIChannels;
}

export class WardenAPI {
    public readonly unresolvedChannels: ConsumerAPIChannels;
    public readonly roles: ConsumerAPIRoles;
    public readonly deletedMessages: Map<Snowflake, Message>;

    private readonly bot: Bot;
    private readonly guild: Snowflake;

    public caseCounter: number;

    // TODO: Type
    private channels?: ConsumerAPIResolvedChannels;

    /**
     * @param {WardenAPIOptions} options
     */
    constructor(options: WardenAPIOptions) {
        this.bot = options.bot;
        this.guild = options.guild;
        this.roles = options.roles;
        this.unresolvedChannels = options.channels;
        this.deletedMessages = new Map<Snowflake, Message>();
        this.caseCounter = 0;
    }

    /**
     * @return {Promise<void>}
     */
    public async setup(): Promise<void> {
        this.channels = {
            modLog: this.getChannel(this.unresolvedChannels.modLog),
            suggestions: this.getChannel(this.unresolvedChannels.suggestions),
            review: this.getChannel(this.unresolvedChannels.review),
            votes: this.getChannel(this.unresolvedChannels.votes),
            decisions: this.getChannel(this.unresolvedChannels.decisions),
            changes: this.getChannel(this.unresolvedChannels.changes)
        };

        this.caseCounter = 0;// TODO await this.getCaseCounter();
    }

    /**
     * @param {ModerationAction} action
     * @return {Promise<void>}
     */
    public async executeAction(action: ModerationAction): Promise<void> {
        switch (action.type) {
            case ModerationActionType.Warn: {
                const caseNum: number = 0; // TODO
                const autoWarn: boolean = action.moderator.id === this.bot.client.user.id;

                const embed: RichEmbed = new RichEmbed()
                    .setTitle(`Warn | Case #${caseNum}`)
                    .addField("Member", `<@${action.member.id}> (${action.member.user.username})`)
                    .addField("Reason", action.reason)
                    .addField("Moderator", `<@${action.moderator.id}> (${action.moderator.user.username})`)
                    .setThumbnail(action.evidence ? action.evidence : "")
                    .setFooter(autoWarn ? "Automatically warned" : `Warned by ${action.moderator.user.username}`, action.moderator.user.avatarURL)
                    .setColor("GOLD");

                if (this.channels) {
                    await this.channels.modLog.send(embed);
                }
                else {
                    Log.error("[WardenAPI.executeAction] Expecting channels");
                }

                const warnDM: string = autoWarn ? `You were automatically warned for **${action.reason}**` : `You were warned by <@${action.moderator.id}> (${action.moderator.user.username}) for **${action.reason}**`;

                await (await action.member.createDM()).send(new RichEmbed()
                    .setDescription(warnDM)
                    .setColor("GOLD")
                    .setTitle(`Case #${caseNum}`));

                break;
            }

            case ModerationActionType.Mute: {
                await action.member.addRole(action.member.guild.roles.find("name", "Muted"), action.reason);

                const caseNum: number = 0; // TODO

                if (this.channels) {
                    await this.channels.modLog.send(new RichEmbed()
                        .setTitle(`Mute | Case #${caseNum}`)
                        .addField("Member", `<@${action.member.id}> (${action.member.user.username})`)
                        .addField("Reason", action.reason)
                        .addField("Moderator", `<@${action.moderator.id}> (${action.moderator.user.username})`)
                        .setThumbnail(action.evidence ? action.evidence : "")
                        .setFooter(`Muted by ${action.moderator.user.username}`, action.moderator.user.avatarURL)
                        .setColor("BLUE"));
                }
                else {
                    Log.error("[WardenAPI.executeAction] Expecting channels");
                }

                (await action.member.createDM()).send(new RichEmbed()
                    .setDescription(`You were muted by <@${action.moderator.id}> (${action.moderator.user.username}) for **${action.reason}**`)
                    .setColor("BLUE")
                    .setTitle(`Case #${caseNum}`));

                break;
            }

            case ModerationActionType.Ban: {
                await action.member.ban({
                    days: 1,
                    reason: action.reason
                });

                const caseNum: number = 0; // TODO

                if (this.channels) {
                    await this.channels.modLog.send(new RichEmbed()
                        .setTitle(`Ban | Case #${caseNum}`)
                        .addField("Member", `<@${action.member.id}> (${action.member.user.username})`)
                        .addField("Reason", action.reason)
                        .addField("Moderator", `<@${action.moderator.id}> (${action.moderator.user.username})`)
                        .setThumbnail(action.evidence ? action.evidence : "")
                        .setFooter(`Banned by ${action.moderator.user.username}`, action.moderator.user.avatarURL)
                        .setColor("RED"));
                }
                else {
                    Log.error("[WardenAPI.executeAction] Expecting channels");
                }

                await (await action.member.createDM()).send(new RichEmbed()
                    .setDescription(`You were banned from **${action.member.guild.name}** by <@${action.moderator.id}> (${action.moderator.user.username}) for **${action.reason}**`)
                    .setColor("RED")
                    .setTitle(`Case #${caseNum}`));

                break;
            }

            default: {
                Log.error(`[WardenAPI.executeAction] Unexpected action type: '${action.type}'`);

                return;
            }
        }

        await WardenAPI.saveAction(action);
    }

    /**
     * @param {ModerationAction} action
     * @return {Promise<void>}
     */
    private static async saveAction(action: ModerationAction): Promise<void> {
        await Mongo.collections.moderationActions.insertOne({
            type: action.type,
            reason: action.reason,
            memberId: action.member.id,
            moderatorId: action.moderator.id,
            end: action.end,
            time: Date.now(),
            evidence: action.evidence
        });
    }

    /**
     * @return {Guild}
     */
    public getGuild(): Guild {
        const guild: Guild | undefined = this.bot.client.guilds.get(this.guild);

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
        else if (!(channel instanceof TextChannel)) {
            Log.throw("[WardenAPI.getChannel] Expecting channel type to be 'TextChannel'");
        }

        return <TextChannel>channel;
    }

    /**
     * @return {number}
     */
    public getCase(): number {
        this.caseCounter++;

        return this.caseCounter - 1;
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
     * @param {CaseOptions} options
     * @return {Promise<void>}
     */
    public async reportCase(options: CaseOptions): Promise<void> {
        if (!this.channels) {
            Log.throw("[WardenAPI.reportCase] Consumer API is not setup");

            return;
        }

        const caseNum = this.getCase();

        const embed = new RichEmbed()
            .setColor(options.color)
            .setAuthor(`Case #${caseNum} | ${options.title}`, options.member.user.avatarURL)
            .addField("User", `<@${options.member.user.id}> (${options.member.user.tag})`)
            .addField("Reason", options.reason)
            .addField("Moderator", `<@${options.moderator.id}> (${options.moderator.tag})`)
            .addField("Time", "*Permanent*")
            .setFooter(`Requested by ${options.moderator.username}`, options.moderator.avatarURL);

        if (options.evidence) {
            embed.setThumbnail(options.evidence);
        }

        this.channels.modLog.send(embed);
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
        else if (WardenApiOld.countBadWords(message.content) > 2) {
            return SuspectedViolation.ExcessiveProfanity;
        }
        else if (WardenApiOld.containsRacialSlurs(message.content)) {
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
}

export default abstract class WardenApiOld {
    public static deletedMessages: any = [];
    public static store: JsonProvider;
    public static caseCounter: number;
    public static modLogChannel: TextChannel;

    public static async reportCase(options: CaseOptions): Promise<void> {
        const caseNum = WardenApiOld.getCase();

        const embed = new RichEmbed()
            .setColor(options.color)
            .setAuthor(`Case #${caseNum} | ${options.title}`, options.member.user.avatarURL)
            .addField("User", `<@${options.member.user.id}> (${options.member.user.tag})`)
            .addField("Reason", options.reason)
            .addField("Moderator", `<@${options.moderator.id}> (${options.moderator.tag})`)
            .addField("Time", "*Permanent*")
            .setFooter(`Requested by ${options.moderator.username}`, options.moderator.avatarURL);

        if (options.evidence) {
            embed.setThumbnail(options.evidence);
        }

        WardenApiOld.modLogChannel.send(embed);
    }

    public static async warn(options: WarnOptions): Promise<boolean> {
        if (!(options.channel instanceof TextChannel)) {
            Log.error("[ConsumerAPI.warn] Expecting channel to be of type 'TextChannel'");

            return false;
        }

        const caseNum: number = WardenApiOld.getCase();

        options.channel.send(new RichEmbed()
            .setTitle(`Warn | Case #${caseNum}`)
            .addField("Member", `<@${options.user.id}> (${options.user.user.username})`)
            .addField("Reason", options.reason)
            .addField("Moderator", `<@${options.moderator.id}> (${options.moderator.username})`)
            .setThumbnail(options.evidence ? options.evidence : "")
            .setFooter(`Warned by ${options.moderator.username}`, options.moderator.avatarURL)
            .setColor("GOLD"));

        (await options.user.createDM()).send(new RichEmbed()
            .setDescription(`You were warned by <@${options.moderator.id}> (${options.moderator.username}) for **${options.reason}**`)
            .setColor("GOLD")
            .setTitle(`Case #${caseNum}`));

        if (options.message.deletable) {
            await options.message.delete();
        }

        WardenApiOld.addWarning(options);

        return true;
    }

    public static async addWarning(options: WarnOptions): Promise<void> {
        if (!options.dataProvider) {
            Log.error("[ConsumerAPI.addWarning] Expecting a data provider");

            return;
        }
        else if (!(options.dataProvider instanceof JsonProvider)) {
            Log.error("[ConsumerAPI.addWarning] Expecting data provider to be of type 'JsonProvider'");

            return;
        }

        const jsonStore: JsonProvider = options.dataProvider;

        jsonStore.push(`warnings.u${options.user.id}`, <StoredWarning>{
            reason: options.reason,
            moderator: options.moderator.id,
            evidence: options.evidence,
            time: Date.now()
        });

        await jsonStore.save();
    }

    public static async mute(options: MuteOptions): Promise<void> {
        await options.user.addRole(options.user.guild.roles.find("name", "Muted"));

        const caseNum: number = WardenApiOld.getCase();

        options.channel.send(new RichEmbed()
            .setTitle(`Mute | Case #${caseNum}`)
            .addField("Member", `<@${options.user.id}> (${options.user.user.username})`)
            .addField("Reason", options.reason)
            .addField("Moderator", `<@${options.moderator.id}> (${options.moderator.username})`)
            .setThumbnail(options.evidence ? options.evidence : "")
            .setFooter(`Muted by ${options.moderator.username}`, options.moderator.avatarURL)
            .setColor("BLUE"));

        (await options.user.createDM()).send(new RichEmbed()
            .setDescription(`You were muted by <@${options.moderator.id}> (${options.moderator.username}) for **${options.reason}**`)
            .setColor("BLUE")
            .setTitle(`Case #${caseNum}`));
    }

    public static getCase(): number {
        WardenApiOld.caseCounter++;

        WardenApiOld.store.set("case_counter", WardenApiOld.caseCounter);

        return WardenApiOld.caseCounter - 1;
    }

    public static getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    public static countBadWords(message: string): number {
        let count = 0;

        for (let i = 0; i < badWords.length; i++) {
            const matches = message.match(new RegExp(badWords[i], "gi"));

            if (matches) {
                count += matches.length;
            }
        }

        return count;
    }

    public static containsRacialSlurs(message: string): boolean {
        for (let i = 0; i < racialSlurs.length; i++) {
            if (message.toLowerCase().includes(racialSlurs[i])) {
                return true;
            }
        }

        return false;
    }
}
