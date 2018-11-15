import {GuildMember, Message, RichEmbed} from "discord.js";
import {Command, IArgument, CommandContext, Utils, RestrictGroup, InternalArgType, ChatEnvironment} from "@cloudrex/forge";
import {CommandType} from "../general/help";

type WhoisArgs = {
    readonly member: GuildMember;
}

export default class WhoisCommand extends Command<WhoisArgs> {
    readonly type = CommandType.Informational;

    readonly meta = {
        name: "whois",
        description: "View information about a user",
    };

    readonly arguments: IArgument[] = [
        {
            name: "member",
            description: "The member to inspect",
            switchShortName: "m",
            type: InternalArgType.Member,
            required: false,
            defaultValue: (msg: Message) => msg.author.id
        }
    ];

    readonly restrict: any = {
        specific: [RestrictGroup.ServerModerator],
        environment: ChatEnvironment.Guild
    };

    public async executed(x: CommandContext, args: WhoisArgs): Promise<void> {
        const roles = args.member.roles.array();

        let finalRoles: string = roles.slice(1, 10).map((role) => `<@&${role.id}>`).join(" ");

        if (roles.length > 10) {
            finalRoles += ` **+ ${roles.length - 10} more**`;
        }

        const embed: RichEmbed = new RichEmbed()
            .setColor("GREEN")
            .setFooter(`Requested by ${x.sender.username}`, x.sender.avatarURL)
            .setThumbnail(args.member.user.avatarURL)
            .addField("User", `<@${args.member.user.id}> (${args.member.user.tag || "*Unknown*"})`)
            .addField("User ID", args.member.id);

        if (args.member.nickname) {
            embed.addField("Nickname", args.member.nickname);
        }

        embed.addField("Type", args.member.user.bot ? ":robot: Bot" : ":raising_hand: Human")
            .addField("Joined Server", Utils.timeAgo(args.member.joinedTimestamp))
            .addField("Account Created", Utils.timeAgo(args.member.user.createdTimestamp))
            .addField("Last Message", args.member.lastMessage ? args.member.lastMessage.content : "*None*")
            .addField(roles.length - 1 > 0 ? `Roles [${roles.length - 1}]` : "Roles", finalRoles || "*None*")
            .addField("Highest Role", args.member.highestRole.toString());

        if (args.member.serverDeaf || args.member.serverMute || args.member.id === args.member.guild.ownerID) {
            const extra: string[] = [];

            if (args.member.serverDeaf) {
                extra.push("Deaf");
            }

            if (args.member.serverMute) {
                extra.push("Mute");
            }

            if (args.member.id === args.member.guild.ownerID) {
                extra.push("Owner");
            }

            embed.addField("Other", extra.join(", "));
        }

        await x.msg.channel.send(embed);
    }
};
