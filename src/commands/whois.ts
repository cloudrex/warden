import {GuildMember, RichEmbed} from "discord.js";
import { Command, CommandContext, Utils, CommandArgument } from "discord-anvil";
import SpecificGroups from "../specific-groups";

interface WhoisArgs {
    readonly member: GuildMember;
}

export default class Whois extends Command {
    readonly meta = {
        name: "whois",
        description: "View information about a user",
    };

    readonly arguments: Array<CommandArgument> = [
        {
            name: "member",
            description: "The member to inspect",
            type: "member",
            required: true
        }
    ];

    constructor() {
        super();

        this.restrict.specific = SpecificGroups.staff;
    }

    public async executed(context: CommandContext, args: WhoisArgs): Promise<void> {
        const roles = args.member.roles.array();

        let finalRoles = roles.slice(1, 10).map((role) => `<@&${role.id}>`).join(" ");

        if (roles.length > 10) {
            finalRoles += ` **+ ${roles.length - 10} more**`;
        }

        await context.message.channel.send(new RichEmbed()
            .setColor("GREEN")
            .setFooter(`Requested by ${context.sender.username}`, context.sender.avatarURL)
            .setThumbnail(args.member.user.avatarURL)
            .addField("User", `<@${args.member.user.id}>`)
            .addField("Tag", args.member.user.tag)
            .addField("Nickname", args.member.nickname ? args.member.nickname : "*None*")
            .addField("Type", args.member.user.bot ? ":robot: Bot" : ":raising_hand: Human")
            .addField("Joined Server", Utils.timeAgo(args.member.joinedTimestamp))
            .addField("Account Created", Utils.timeAgo(args.member.user.createdTimestamp))
            .addField("Last Message", args.member.lastMessage ? args.member.lastMessage.content : "*None*")
            .addField(`Roles [${roles.length - 1}]`, finalRoles)
            .addField("User ID", args.member.id));
    }
};
