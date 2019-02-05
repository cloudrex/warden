import {Service, DiscordEvent, Utils, IFragmentMeta} from "@cloudrex/forge";
import {Role, TextChannel, Guild, RichEmbed, GuildChannel, Emoji, GuildMember, User} from "discord.js";
import {Name, Description} from "d.mix";

@Name("log")
@Description("Log server events and actions")
export default class LogService extends Service {
    public start(): void {
        this.on(DiscordEvent.RoleCreated, (role: Role) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(role.guild);

            if (logChannel) {
                this.send(logChannel, new RichEmbed()
                    .setColor("GREEN")
                    .setTitle("Role Created")
                    .setDescription(`Role <@${role.id}> was created`));
            }
        });

        this.on(DiscordEvent.RoleDeleted, (role: Role) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(role.guild);

            if (logChannel) {
                this.send(logChannel, new RichEmbed()
                    .setColor("RED")
                    .setTitle("Role Deleted")
                    .setDescription(`Role '${role.name}' (${role.id}) was deleted`));
            }
        });

        this.on(DiscordEvent.RoleUpdated, (old: Role, updated: Role) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(old.guild);

            if (logChannel) {
                const embed: RichEmbed = new RichEmbed()
                    .setColor("BLUE")
                    .setTitle("Role Updated")
                    .setDescription(`Role '${old.name}' (<@&${old.id}>) was updated`);

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

                this.send(logChannel, embed);
            }
        });

        this.on(DiscordEvent.ChannelCreated, (channel: GuildChannel) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(channel.guild);

            if (logChannel) {
                this.send(logChannel, new RichEmbed()
                    .setColor("GREEN")
                    .setTitle("Channel Created")
                    .setDescription(`Channel '${channel.name}' ${channel.type === "text" ? `(<#${channel.id}>)` : ""} was created`));
            }
        });

        this.on(DiscordEvent.ChannelDeleted, (channel: GuildChannel) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(channel.guild);

            if (logChannel) {
                this.send(logChannel, new RichEmbed()
                    .setColor("RED")
                    .setTitle("Channel Deleted")
                    .setDescription(`Channel '${channel.name}' (${channel.id}) was deleted`));
            }
        });

        /* this.on(DiscordEvent.ChannelUpdated, (old: GuildChannel, updated: GuildChannel) => {
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

                this.send(logChannel, embed);
            }
        }); */

        this.on(DiscordEvent.EmojiCreated, (emoji: Emoji) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(emoji.guild);

            if (logChannel) {
                this.send(logChannel, new RichEmbed()
                    .setColor("GREEN")
                    .setTitle("Emoji Created")
                    .setDescription(`Emoji '${emoji.name}' (${emoji.toString()}) was created`));
            }
        });

        this.on(DiscordEvent.EmojiDeleted, (emoji: Emoji) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(emoji.guild);

            if (logChannel) {
                this.send(logChannel, new RichEmbed()
                    .setColor("RED")
                    .setTitle("Emoji Deleted")
                    .setDescription(`Emoji '${emoji.name}' (${emoji.id}) was deleted`));
            }
        });

        this.on(DiscordEvent.EmojiUpdated, (old: Emoji, updated: Emoji) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(old.guild);

            if (logChannel) {
                const embed: RichEmbed = new RichEmbed()
                    .setColor("BLUE")
                    .setTitle("Emoji Updated")
                    .setDescription(`Emoji '${old.name}' (${old.toString()}) was updated`);

                if (old.name !== updated.name) {
                    embed.addField("Name", `${old.name} ⇒ ${updated.name}`);
                }

                this.send(logChannel, embed);
            }
        });

        this.on(DiscordEvent.GuildBanAdded, (guild: Guild, user: User) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(guild);

            if (logChannel) {
                this.send(logChannel, new RichEmbed()
                    .setColor("RED")
                    .setTitle("Member Banned")
                    .setDescription(`Member '${user.tag}' (${user.id}) was banned`));
            }
        });

        this.on(DiscordEvent.GuildBanRemoved, (guild: Guild, user: User) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(guild);

            if (logChannel) {
                this.send(logChannel, new RichEmbed()
                    .setColor("GREEN")
                    .setTitle("Member Unbanned")
                    .setDescription(`Member '${user.tag}' (${user.id}) was unbanned`));
            }
        });

        this.on(DiscordEvent.GuildMemberJoined, (member: GuildMember) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(member.guild);

            if (logChannel) {
                this.send(logChannel, new RichEmbed()
                    .setColor("GREEN")
                    .setTitle("Member Joined")
                    .setDescription(`Member '${member.user.tag}' (<@${member.id}>) joined`));
            }
        });

        this.on(DiscordEvent.GuildMemberLeft, (member: GuildMember) => {
            const logChannel: TextChannel | null = LogService.getLogChannel(member.guild);

            if (logChannel) {
                this.send(logChannel, new RichEmbed()
                    .setColor("RED")
                    .setTitle("Member Left")
                    .setDescription(`Member '${member.user.tag}' (${member.id}) left`));
            }
        });
    }

    private send(logChannel: TextChannel, embed: RichEmbed): void {
        logChannel.send(embed).catch(() => {});
    }

    // TODO: Use a better method to find the channel
    private static getLogChannel(guild: Guild): TextChannel | null {
        return guild.channels.find((channel: GuildChannel) => {
            return channel.name === "server-log" && channel.type === "text";
        }) as TextChannel || null;
    }

    // TODO:
    readonly canStart = (): boolean => {
        return false;
    }
}
