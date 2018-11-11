import {Service, DiscordEvent, Utils} from "@cloudrex/forge";
import {IFragmentMeta} from "@cloudrex/forge/fragments/fragment";
import {Role, TextChannel, Guild, RichEmbed, GuildChannel, Emoji, GuildMember, User} from "discord.js";

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

        this.bot.client.on(DiscordEvent.RoleUpdated, (old: Role, updated: Role) => {
            const channel: TextChannel | null = LogService.getLogChannel(old.guild);

            if (channel) {
                const embed: RichEmbed = new RichEmbed()
                    .setColor("BLUE")
                    .setTitle("Role Updated")
                    .setDescription(`Role <@${old.id}> was updated`);

                if (old.name !== updated.name) {
                    embed.addField("Name", `${old.name} ⇒ ${updated.name}`);
                }

                if (old.hoist !== updated.hoist) {
                    embed.addField("Hoisted", `${old.hoist} ⇒ ${updated.hoist}`);
                }

                if (old.hexColor !== updated.hexColor) {
                    embed.addField("Color", `${old.hexColor} ⇒ ${updated.hexColor}`);
                }

                if (old.permissions !== updated.permissions) {
                    embed.addField("Permissions", `${old.permissions} ⇒ ${updated.permissions}`);
                }

                if (old.mentionable !== updated.mentionable) {
                    embed.addField("Mentionable", `${old.mentionable} ⇒ ${updated.mentionable}`);
                }

                if (old.position !== updated.position) {
                    embed.addField("Position", `${old.position} ⇒ ${updated.position}`);
                }

                channel.send(embed);
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

        this.bot.client.on(DiscordEvent.ChannelUpdated, (old: GuildChannel, updated: GuildChannel) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(old.guild);

            if (logChannel) {
                const embed: RichEmbed = new RichEmbed()
                    .setColor("BLUE")
                    .setTitle("Channel Updated")
                    .setDescription(`Channel '${old.name}' ${old.type === "text" ? `(<#${old.id}>)` : ""} was updated`);

                if (old.name !== updated.name) {
                    embed.addField("Name", `${old.name} ⇒ ${updated.name}`);
                }

                if (old.type === "text" && updated.type === "text") {
                    const textOld: TextChannel = old as TextChannel;
                    const textUpdated: TextChannel = updated as TextChannel;

                    if (textOld.nsfw !== textUpdated.nsfw) {
                        embed.addField("NSFW", `${textOld.nsfw} ⇒ ${textUpdated.nsfw}`);
                    }

                    if (textOld.topic !== textUpdated.topic) {
                        embed.addField("Topic", `${Utils.trim(textOld.topic, 60)} ⇒ ${Utils.trim(textUpdated.topic, 60)}`);
                    }
                }

                logChannel.send(embed);
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

        this.bot.client.on(DiscordEvent.EmojiUpdated, (old: Emoji, updated: Emoji) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(old.guild);

            if (logChannel) {
                const embed: RichEmbed = new RichEmbed()
                    .setColor("BLUE")
                    .setTitle("Emoji Updated")
                    .setDescription(`Emoji '${old.name}' was updated`);

                if (old.name !== updated.name) {
                    embed.addField("Name", `${old.name} ⇒ ${updated.name}`);
                }

                logChannel.send(embed);
            }
        });

        this.bot.client.on(DiscordEvent.GuildBanAdded, (guild: Guild, user: User) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(guild);

            if (logChannel) {
                logChannel.send(new RichEmbed()
                    .setColor("RED")
                    .setTitle("Member Banned")
                    .setDescription(`Member '${user.tag}' (${user.id}) was banned`));
            }
        });

        this.bot.client.on(DiscordEvent.GuildBanRemoved, (guild: Guild, user: User) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(guild);

            if (logChannel) {
                logChannel.send(new RichEmbed()
                    .setColor("GREEN")
                    .setTitle("Member Unbanned")
                    .setDescription(`Member '${user.tag}' (${user.id}) was unbanned`));
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
        return guild.channels.find((channel: GuildChannel) => {
            return channel.name === "server-log" && channel.type === "text";
        }) as TextChannel || null;
    }
}