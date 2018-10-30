import {Command, IArgument, CommandContext, InternalArgType, ChatEnvironment} from "@cloudrex/forge";
import {CommandType} from "../general/help";
import {GuildMember, RichEmbed} from "discord.js";

type AvatarArgs = {
    readonly member: GuildMember;
};

export default class AvatarCommand extends Command<AvatarArgs> {
    readonly type = CommandType.Configuration;

    readonly meta = {
        name: "avatar",
        description: "Retrieve the avatar image of an user"
    };

    readonly aliases = ["pfp"];

    readonly arguments: IArgument[] = [
        {
            name: "member",
            description: "The member to inspect",
            switchShortName: "u",
            type: InternalArgType.Member,
            required: true
        }
    ];

    readonly restrict: any = {
        environment: ChatEnvironment.Guild
    };

    public async executed(context: CommandContext, args: AvatarArgs): Promise<void> {
        await context.message.channel.send(new RichEmbed()
            .setColor("GREEN")
            .setImage(args.member.user.avatarURL));
    }
};
