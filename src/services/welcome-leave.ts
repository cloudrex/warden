import {GuildMember, User} from "discord.js";
import {Utils, Service} from "forge";
import {config} from "../app";

type WelcomeLeaveMessages = {
    readonly welcome: string[];
    readonly goodbye: string[];
};

let messages: WelcomeLeaveMessages | null = null;

export default class WelcomeLeaveService extends Service {
    readonly meta = {
        name: "welcome & leave",
        description: "Greet and wave goodbye to users who join and leave"
    };

    public async start(): Promise<void> {
        // TODO: Disabled, using Tux's token.
        return;

        messages = await Utils.readJson("./src/data/welcome-leave-messages.json");

        this.bot.client.on("guildMemberAdd", async (member: GuildMember) => {
            if (config.logMembers) {
                await WelcomeLeaveService.sendMemberLog(member, true);
            }

            if (config.announceJoins) {
                WelcomeLeaveService.sendGeneral(`${WelcomeLeaveService.getMessage("welcome", member.user)}\n\n*Make sure to read the <#458708940809699368>!*`, "Joined", member);
            }
        });


        this.bot.client.on("guildMemberRemove", async (member: GuildMember) => {
            if (config.logMembers) {
                await WelcomeLeaveService.sendMemberLog(member, false);
            }

            // No longer announce leaves
            //WelcomeLeaveService.sendGeneral(WelcomeLeaveService.getMessage("goodbye", member.user), "Left", member);
        });
    }

    private static sendGeneral(text: string, titleSuffix: string, member: GuildMember, color = "GREEN"): void {
        Utils.send({
            title: `Member ${titleSuffix}`,
            color: color,
            footer: `${member.guild.memberCount} members`,
            user: member.user,
            channel: member.guild.channels.get("286352649610199052"), // General
            message: text
        });
    }

    /**
     * @todo Return type
     * @param {GuildMember} member
     * @param {boolean} joined Whether the member joined
     * @return {Promise<*>}
     */
    private static async sendMemberLog(member: GuildMember, joined: boolean): Promise<any> {
        return Utils.send({
            title: `Member ${joined ? "Joined" : "Left"}`,
            channel: member.guild.channels.get("463486605861191700"), // Member Log
            footer: `${member.guild.memberCount} members`,
            color: joined ? "GREEN" : "RED",
            message: `<@${member.id}> (${member.user.tag}) ${joined ? "joined" : "left"}`,
            user: member.user
        });
    }

    /**
     * @param {number} min
     * @param {number} max
     * @return {number}
     */
    private static getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * @param {string} category
     * @param {User} user
     * @return {string}
     */
    private static getMessage(category: string, user: User): string {
        return (messages as any)[category][WelcomeLeaveService.getRandomInt(0, (messages as any)[category].length)].replace(/\{user\}/g, `<@${user.id}>`);
    }
}
