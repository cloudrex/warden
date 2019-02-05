import {Command, IArgument, CommandContext, TrivialArgType, RestrictGroup, ChatEnvironment, InternalArgType} from "@cloudrex/forge";
import {CommandType} from "../general/help";
import {GuildMember, Message, RichEmbed} from "discord.js";
import {Name, Description, Arguments, Constraints, ChatEnv, Context} from "d.mix";

interface ILocalArgs {
    readonly member: GuildMember;
    readonly message: string;
}

@Name("emulate")
@Description("Emulate a message from a certain user")
@Arguments(
    {
        name: "member",
        description: "The author of the emulated message",
        switchShortName: "u",
        type: InternalArgType.Member,
        required: true
    },
    {
        name: "message",
        description: "The emulated message",
        switchShortName: "m",
        type: TrivialArgType.String,
        required: true
    }
)
@Constraints({
    specific: [RestrictGroup.BotOwner],
    environment: ChatEnv.Guild
})
export default class EmulateCommand extends Command<ILocalArgs> {
    readonly type = CommandType.Utility;

    public async run($: Context, args: ILocalArgs) {
        await $.msg.channel.send(new RichEmbed()
            .setTitle(`Emulation for ${args.member.user.username}`)
            .setColor("GREEN")
            .setFooter(`Requested by ${$.sender.tag}`, $.sender.avatarURL)
            .setDescription(`Emulating message from **${args.member.user.username}** containing *${args.message.length > 70 ? args.message.substring(0, 66) + " ..." : args.message}*`));

        const modifiedMessage: Message = Object.assign({}, $.msg);

        modifiedMessage.content = args.message;
    }
};
