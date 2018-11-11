import {Service, DiscordEvent} from "@cloudrex/forge";
import {IFragmentMeta} from "@cloudrex/forge/fragments/fragment";
import {Role, TextChannel, Guild, RichEmbed, GuildChannel, Emoji, GuildMember} from "discord.js";

export default class LogService extends Service {
    readonly meta: IFragmentMeta = {
        name: "log",
        description: "Log server events and actions"
    };

    public start(): void {
        this.bot.client.on(DiscordEvent.RoleCreated, (role: Role) => {
            const channel: TextChannel | null = LogService.getLogChannel(role.guild);

            if (channel) {
                channel.send(new RichEmbed()
                    .setColor("GREEN")
                    .setTitle("Role Created")
                    .setDescription(`Role <@${role.id}> was created`));
            }
        });

        this.bot.client.on(DiscordEvent.RoleDeleted, (role: Role) => {
            const channel: TextChannel | null = LogService.getLogChannel(role.guild);

            if (channel) {
                channel.send(new RichEmbed()
                    .setColor("RED")
                    .setTitle("Role Deleted")
                    .setDescription(`Role <@${role.id}> was deleted`));
            }
        });

        this.bot.client.on(DiscordEvent.RoleUpdated, (role: Role) => {
            const channel: TextChannel | null = LogService.getLogChannel(role.guild);

            if (channel) {
                channel.send(new RichEmbed()
                    .setColor("BLUE")
                    .setTitle("Role Updated")
                    .setDescription(`Role <@${role.id}> was updated`));
            }
        });

        this.bot.client.on(DiscordEvent.ChannelCreated, (channel: GuildChannel) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(channel.guild);

            if (logChannel) {
                logChannel.send(new RichEmbed()
                    .setColor("GREEN")
                    .setTitle("Channel Created")
                    .setDescription(`Channel '${channel.name}' ${channel.type === "text" ? `(<#${channel.id}>)` : ""} was created`));
            }
        });

        this.bot.client.on(DiscordEvent.ChannelDeleted, (channel: GuildChannel) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(channel.guild);

            if (logChannel) {
                logChannel.send(new RichEmbed()
                    .setColor("RED")
                    .setTitle("Channel Deleted")
                    .setDescription(`Channel '${channel.name}' (${channel.id}) was deleted`));
            }
        });

        this.bot.client.on(DiscordEvent.ChannelUpdated, (channel: GuildChannel) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(channel.guild);

            if (logChannel) {
                logChannel.send(new RichEmbed()
                    .setColor("BLUE")
                    .setTitle("Channel Updated")
                    .setDescription(`Channel '${channel.name}' ${channel.type === "text" ? `(<#${channel.id}>)` : ""} was updated`));
            }
        });

        this.bot.client.on(DiscordEvent.EmojiCreated, (emoji: Emoji) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(emoji.guild);

            if (logChannel) {
                logChannel.send(new RichEmbed()
                    .setColor("GREEN")
                    .setTitle("Emoji Created")
                    .setDescription(`Emoji '${emoji.name}' was created`));
            }
        });

        this.bot.client.on(DiscordEvent.EmojiDeleted, (emoji: Emoji) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(emoji.guild);

            if (logChannel) {
                logChannel.send(new RichEmbed()
                    .setColor("RED")
                    .setTitle("Emoji Deleted")
                    .setDescription(`Emoji '${emoji.name}' was deleted`));
            }
        });

        this.bot.client.on(DiscordEvent.EmojiUpdated, (emoji: Emoji) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(emoji.guild);

            if (logChannel) {
                logChannel.send(new RichEmbed()
                    .setColor("BLUE")
                    .setTitle("Emoji Updated")
                    .setDescription(`Emoji '${emoji.name}' was updated`));
            }
        });

        this.bot.client.on(DiscordEvent.GuildBanAdded, (member: GuildMember) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(member.guild);

            if (logChannel) {
                logChannel.send(new RichEmbed()
                    .setColor("RED")
                    .setTitle("Member Banned")
                    .setDescription(`Member '${member.user.tag}' (${member.id}) was banned`));
            }
        });

        this.bot.client.on(DiscordEvent.GuildBanRemoved, (member: GuildMember) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(member.guild);

            if (logChannel) {
                logChannel.send(new RichEmbed()
                    .setColor("GREEN")
                    .setTitle("Member Unbanned")
                    .setDescription(`Member '${member.user.tag}' (${member.id}) was unbanned`));
            }
        });

        this.bot.client.on(DiscordEvent.GuildMemberJoined, (member: GuildMember) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(member.guild);

            if (logChannel) {
                logChannel.send(new RichEmbed()
                    .setColor("GREEN")
                    .setTitle("Member Joined")
                    .setDescription(`Member '${member.user.tag}' (<@${member.id}>) joined`));
            }
        });

        this.bot.client.on(DiscordEvent.GuildMemberLeft, (member: GuildMember) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(member.guild);

            if (logChannel) {
                logChannel.send(new RichEmbed()
                    .setColor("RED")
                    .setTitle("Member Left")
                    .setDescription(`Member '${member.user.tag}' (${member.id}) left`));
            }
        });
    }

    // TODO: Use a better method to find the channel
    private static getLogChannel(guild: Guild): TextChannel | null {
        return guild.channels.find("name", "server-log") as TextChannel || null;
    }
}