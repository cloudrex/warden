import {Command, IArgument, CommandContext, TrivialArgType, RestrictGroup, ChatEnvironment, InternalArgType} from "@cloudrex/forge";
import {CommandType} from "../general/help";
import {GuildMember, Message, RichEmbed} from "discord.js";

type EmulateArgs = {
    readonly member: GuildMember;
    readonly message: string;
}

export default class EmulateCommand extends Command<EmulateArgs> {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "emulate",
        description: "Emulate a message"
    };

    readonly arguments: IArgument[] = [
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
    ];

    readonly restrict: any = {
        specific: [RestrictGroup.BotOwner],
        environment: ChatEnvironment.Guild
    };

    public async executed(context: CommandContext, args: EmulateArgs): Promise<void> {
        await context.message.channel.send(new RichEmbed()
            .setTitle(`Emulation for ${args.member.user.username}`)
            .setColor("GREEN")
            .setFooter(`Requested by ${context.sender.tag}`, context.sender.avatarURL)
            .setDescription(`Emulating message from **${args.member.user.username}** containing *${args.message.length > 70 ? args.message.substring(0, 66) + " ..." : args.message}*`));

        const modifiedMessage: Message = Object.assign({}, context.message);

        modifiedMessage.content = args.message;
    }
};
