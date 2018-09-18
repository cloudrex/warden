import {exec} from "child_process";
import {Command, CommandContext} from "discord-anvil";
import {CommandType} from "../general/help";
import {CommandArgument, CommandRestrictGroup} from "discord-anvil/dist/commands/command";
import {GuildMember, RichEmbed} from "discord.js";

type AvatarArgs = {
    readonly member: GuildMember;
};

export default class Avatar extends Command {
    readonly type = CommandType.Configuration;

    readonly meta = {
        name: "avatar",
        description: "Retrieve the avatar image of an user"
    };

    readonly aliases = ["pfp"];

    readonly arguments: Array<CommandArgument> = [
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
