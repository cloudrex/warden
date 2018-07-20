import {StoredWarning} from "./commands/warnings";
import {Guild, GuildMember, Message, RichEmbed, Snowflake, TextChannel, User} from "discord.js";
import { DataProvider, Bot, Log, JsonProvider } from "discord-anvil";

const badWords = [
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

const racialSlurs = [
    "nigg",
    "zipperhead",
    "bobo",
    "amigo",
    "blaxican",
    "brownie",
    "faggot",
    "nibba"
];

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
}

export interface ConsumerAPIResolvedChannels {
    readonly modLog: TextChannel;
    readonly suggestions: TextChannel;
    readonly review: TextChannel;
}

export interface ConsumerAPIRoles {
    readonly muted: Snowflake;
}

export interface ConsumerAPIv2Options {
    readonly bot: Bot;
    readonly guild: Snowflake;
    readonly roles: ConsumerAPIRoles;
    readonly channels: ConsumerAPIChannels;
}

export class ConsumerAPIv2 {
    readonly unresolvedChannels: ConsumerAPIChannels;
    readonly roles: ConsumerAPIRoles;

    private readonly bot: Bot;
    private readonly guild: Snowflake;

    // TODO: Type
    private deletedMessages: any;
    private channels?: ConsumerAPIResolvedChannels;

    constructor(options: ConsumerAPIv2Options) {
        this.bot = options.bot;
        this.guild = options.guild;
        this.roles = options.roles;
        this.unresolvedChannels = options.channels;
        this.deletedMessages = [];
    }

    setup(): void {
        this.channels = {
            modLog: this.getChannel(this.unresolvedChannels.modLog),
            suggestions: this.getChannel(this.unresolvedChannels.suggestions),
            review: this.getChannel(this.unresolvedChannels.review)
        };
    }

    getGuild(): Guild {
        const guild: Guild | undefined = this.bot.client.guilds.get(this.guild);

        if (!guild) {
            // TODO: Rethrowing to avoid IDE error
            Log.throw("[ConsumerAPIv2.getGuild] Expecting guild");

            throw new Error("[ConsumerAPIv2.getGuild] Expecting guild");
        }

        return guild;
    }

    getChannel(id: Snowflake): TextChannel {
        const channel = this.getGuild().channels.get(id);

        if (!channel) {
            Log.throw("[ConsumerAPIv2.getChannel] Expecting channel");
        }
        else if (!(channel instanceof TextChannel)) {
            Log.throw("[ConsumerAPIv2.getChannel] Expecting channel type to be 'TextChannel'");
        }

        return <TextChannel>channel;
    }

    getCase(): number {
        // TODO

        return 0;
    }

    async saveWarning(options: WarnOptionsv2): Promise<void> {
        if (!this.bot.dataStore) {
            Log.error("[ConsumerAPIv2.addWarning] Expecting a data provider");

            return;
        }
        else if (!(this.bot.dataStore instanceof JsonProvider)) {
            Log.error("[ConsumerAPIv2.addWarning] Expecting data provider to be of type 'JsonProvider'");

            return;
        }

        const jsonStore: JsonProvider = this.bot.dataStore;

        jsonStore.push(`warnings.u${options.user.id}`, <StoredWarning>{
            reason: options.reason,
            moderator: options.moderator.id,
            evidence: options.evidence,
            time: Date.now()
        });

        await jsonStore.save();
    }

    async warn(options: WarnOptionsv2): Promise<boolean> {
        if (!this.channels) {
            Log.error("[ConsumerAPI.warn] Expecting channels");

            return false;
        }

        if (!(this.channels.modLog instanceof TextChannel)) {
            Log.error("[ConsumerAPI.warn] Expecting ModLog channel to be of type 'TextChannel'");

            return false;
        }

        const caseNum: number = WardenApi.getCase();

        this.channels.modLog.send(new RichEmbed()
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

        await this.saveWarning(options);

        return true;
    }

    async addSuggestion(suggestion: string, author: GuildMember): Promise<boolean> {
        if (!this.channels) {
            Log.throw("[ConsumerAPIv2.addSuggestion] Consumer API is not setup");

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

    async reportCase(options: CaseOptions): Promise<void> {
        if (!this.channels) {
            Log.throw("[ConsumerAPIv2.reportCase] Consumer API is not setup");

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

    // TODO: Using ConsumerAPI
    static isMessageSuspicious(message: Message): string {
        if (message.content.length > 500) {
            return SuspectedViolation.Long;
        }
        else if (message.mentions.users.size > 3) {
            return SuspectedViolation.MassMentions;
        }
        else if (!message.author.bot && message.content.split("`").length < 6 && message.content.split("\n").length > 2) {
            return SuspectedViolation.MultipleNewLines;
        }
        else if (WardenApi.countBadWords(message.content) > 2) {
            return SuspectedViolation.ExcessiveProfanity;
        }
        else if (WardenApi.containsRacialSlurs(message.content)) {
            return SuspectedViolation.RacialSlurs;
        }

        // TODO: Add missing checks

        return SuspectedViolation.None;
    }

    async flagMessage(message: Message, suspectedViolation: string): Promise<void> {
        if (!this.channels) {
            Log.error("[ConsumerAPI.flagMessage] Expecting channels");

            return;
        }
        else if (!this.channels.review) {
            Log.error("[ConsumerAPI.flagMessage] Review channel does not exist, failed to flag message");

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

    getLastDeletedMessage(channelId: Snowflake): Message | null {
        if (WardenApi.deletedMessages[channelId]) {
            return WardenApi.deletedMessages[channelId];
        }

        return null;
    }
}

export default abstract class WardenApi {
    static deletedMessages: any = [];
    static store: JsonProvider;
    static caseCounter: number;
    static modLogChannel: TextChannel;

    static async reportCase(options: CaseOptions): Promise<void> {
        const caseNum = WardenApi.getCase();

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

        WardenApi.modLogChannel.send(embed);
    }

    static async warn(options: WarnOptions): Promise<boolean> {
        if (!(options.channel instanceof TextChannel)) {
            Log.error("[ConsumerAPI.warn] Expecting channel to be of type 'TextChannel'");

            return false;
        }

        const caseNum: number = WardenApi.getCase();

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

        WardenApi.addWarning(options);

        return true;
    }

    static async addWarning(options: WarnOptions): Promise<void> {
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

    static async mute(options: MuteOptions): Promise<void> {
        await options.user.addRole(options.user.guild.roles.find("name", "Muted"));

        const caseNum: number = WardenApi.getCase();

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

    static getCase(): number {
        WardenApi.caseCounter++;

        WardenApi.store.set("case_counter", WardenApi.caseCounter);

        return WardenApi.caseCounter - 1;
    }

    static getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static countBadWords(message: string): number {
        let count = 0;

        for (let i = 0; i < badWords.length; i++) {
            const matches = message.match(new RegExp(badWords[i], "gi"));

            if (matches) {
                count += matches.length;
            }
        }

        return count;
    }

    static containsRacialSlurs(message: string): boolean {
        for (let i = 0; i < racialSlurs.length; i++) {
            if (message.toLowerCase().includes(racialSlurs[i])) {
                return true;
            }
        }

        return false;
    }
}
