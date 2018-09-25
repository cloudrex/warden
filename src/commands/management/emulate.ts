import {Command, Argument, CommandContext} from "discord-anvil";
import {PrimitiveArgType, RestrictGroup} from "discord-anvil/dist/commands/command";
import {CommandType} from "../general/help";
import {GuildMember, Message, RichEmbed} from "discord.js";
import {ChatEnvironment} from "discord-anvil";

type EmulateArgs = {
    readonly member: GuildMember;
    readonly message: string;
}

export default class Emulate extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "emulate",
        description: "Emulate a message"
    };

    readonly arguments: Array<Argument> = [
        {
            name: "member",
            description: "The author of the emulated message",
            type: "member",
            required: true
        },
        {
            name: "message",
            description: "The emulated message",
            type: PrimitiveArgType.String,
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
