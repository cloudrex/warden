import {GuildMember, User} from "discord.js";
import {Utils, Bot, Service} from "discord-anvil";

type WelcomeLeaveMessages = {
    readonly welcome: Array<string>;
    readonly goodbye: Array<string>;
};

let messages: WelcomeLeaveMessages | null = null;

export default class WelcomeLeave extends Service {
    readonly meta = {
        name: "welcome & leave",
        description: "Greet and wave goodbye to users who join and leave"
    };

    public async start(): Promise<void> {
        messages = await Utils.readJson("./src/data/welcome-leave-messages.json");

        this.bot.client.on("guildMemberAdd", (member: GuildMember) => {
            WelcomeLeave.sendGeneral(`${WelcomeLeave.getMessage("welcome", member.user)}\n\n*Make sure to read the <#458708940809699368>!*`, "Joined", member);
        });

        this.bot.client.on("guildMemberRemove", (member: GuildMember) => {
            WelcomeLeave.sendGeneral(WelcomeLeave.getMessage("goodbye", member.user), "Left", member);
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

    private static getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private static getMessage(category: string, user: User): string {
        return (messages as any)[category][WelcomeLeave.getRandomInt(0, (messages as any)[category].length)].replace(/\{user\}/g, `<@${user.id}>`);
    }
}
