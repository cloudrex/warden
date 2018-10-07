import {Command} from "forge";
import {CommandType} from "../general/help";
import {Argument} from "forge/dist/commands/command";
import {GuildMember, RichEmbed} from "discord.js";
import CommandContext from "forge/dist/commands/command-context";

type AvatarArgs = {
    readonly member: GuildMember;
};

export default class AvatarCommand extends Command {
    readonly type = CommandType.Configuration;

    readonly meta = {
        name: "avatar",
        description: "Retrieve the avatar image of an user"
    };

    readonly aliases = ["pfp"];

    readonly arguments: Array<Argument> = [
        {
            name: "member",
            description: "The member to inspect",
            type: "member",
            required: true
        }
    ];

    public async executed(context: CommandContext, args: AvatarArgs): Promise<void> {
        await context.message.channel.send(new RichEmbed()
            .setColor("GREEN")
            .setImage(args.member.user.avatarURL));
    }
};
