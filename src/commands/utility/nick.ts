import {IArgument, ChatEnvironment, Command, Permission, TrivialArgType, CommandContext} from "@cloudrex/forge";
import {CommandType} from "../general/help";

type NickArgs = {
    readonly nickname: string;
}

export default class NickCommand extends Command<NickArgs> {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "nick",
        description: "Manage nicknames"
    };

    readonly aliases = ["nickname"];

    readonly arguments: IArgument[] = [
        {
            name: "nickname",
            description: "The desired nickname",
            switchShortName: "n",
            type: TrivialArgType.String,
            required: true
        }
    ];

    readonly restrict: any = {
        environment: ChatEnvironment.Guild,
        selfPermissions: [Permission.ManageNicknames],
        issuerPermissions: [Permission.ChangeNickname]
    };

    public async executed(x: CommandContext, args: NickArgs): Promise<void> {
        await x.msg.member.setNickname(args.nickname);
    }
};
