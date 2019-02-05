import {Command, IArgument, CommandContext, InternalArgType, ChatEnvironment} from "@cloudrex/forge";
import {CommandType} from "../general/help";
import {GuildMember, RichEmbed} from "discord.js";
import {Name, Description, Aliases, Arguments, Constraint, ChatEnv} from "d.mix";

interface ILocalArgs {
    readonly member: GuildMember;
};

@Name("avatar")
@Description("Retrieve the avatar image of an user")
@Aliases("pfp")
@Arguments({
    name: "member",
    description: "The member to inspect",
    switchShortName: "u",
    type: InternalArgType.Member,
    required: true
})
@Constraint.Env(ChatEnv.Guild)
export default class AvatarCommand extends Command {
    readonly type = CommandType.Configuration;

    public async run($: CommandContext, args: ILocalArgs) {
        await $.msg.channel.send(new RichEmbed().setColor("GREEN")
            .setImage(args.member.user.avatarURL));
    }
};
