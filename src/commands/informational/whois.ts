import {GuildMember, Message, RichEmbed} from "discord.js";
import {CommandType} from "../general/help";
import {Name, Description, Arguments, Constraints, ChatEnv, Context} from "d.mix";

interface ILocalArgs {
    readonly member: GuildMember;
}

@Name("whois")
@Description("View information about a user")
@Arguments(
    {
        name: "member",
        description: "The member to inspect",
        switchShortName: "m",
        type: InternalArgType.Member,
        required: false,
        defaultValue: (msg: Message) => msg.author.id
    }
)
@Constraints({
    specific: [RestrictGroup.ServerModerator],
    environment: ChatEnv.Guild
})
export default class extends Command {
    readonly type = CommandType.Informational;

    public async run($: Context, args: ILocalArgs) {
        const roles = args.member.roles.array();

        let finalRoles: string = roles.slice(1, 10).map((role) => `<@&${role.id}>`).join(" ");

        if (roles.length > 10) {
            finalRoles += ` **+ ${roles.length - 10} more**`;
        }

        const embed: RichEmbed = new RichEmbed()
            .setColor("GREEN")
            .setFooter(`Requested by ${$.sender.username}`, $.sender.avatarURL)
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

        await $.msg.channel.send(embed);
    }
};
