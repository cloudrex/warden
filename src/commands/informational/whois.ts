import {GuildMember, Message, RichEmbed} from "discord.js";
import {Command, Argument, CommandContext, Utils, RestrictGroup, InternalArgType} from "@cloudrex/forge";
import {CommandType} from "../general/help";

type WhoisArgs = {
    readonly member: GuildMember;
}

export default class WhoisCommand extends Command {
    readonly type = CommandType.Informational;

    readonly meta = {
        name: "whois",
        description: "View information about a user",
    };

    readonly arguments: Argument[] = [
        {
            name: "member",
            description: "The member to inspect",
            type: InternalArgType.Member,
            required: false,
            defaultValue: (message: Message) => message.author.id
        }
    ];

    readonly restrict: any = {
        specific: [RestrictGroup.ServerModerator]
    };

    public async executed(context: CommandContext, args: WhoisArgs): Promise<void> {
        const roles = args.member.roles.array();

        let finalRoles: string = roles.slice(1, 10).map((role) => `<@&${role.id}>`).join(" ");

        if (roles.length > 10) {
            finalRoles += ` **+ ${roles.length - 10} more**`;
        }

        await context.message.channel.send(new RichEmbed()
            .setColor("GREEN")
            .setFooter(`Requested by ${context.sender.username}`, context.sender.avatarURL)
            .setThumbnail(args.member.user.avatarURL)
            .addField("User", `<@${args.member.user.id}>`)
            .addField("Tag", args.member.user.tag || "*Unknown*")
            .addField("Nickname", args.member.nickname || "*None*")
            .addField("Type", args.member.user.bot ? ":robot: Bot" : ":raising_hand: Human")
            .addField("Joined Server", Utils.timeAgo(args.member.joinedTimestamp))
            .addField("Account Created", Utils.timeAgo(args.member.user.createdTimestamp))
            .addField("Last Message", args.member.lastMessage ? args.member.lastMessage.content : "*None*")
            .addField(roles.length - 1 > 0 ? `Roles [${roles.length - 1}]` : "Roles", finalRoles || "*None*")
            .addField("User ID", args.member.id));
    }
};
