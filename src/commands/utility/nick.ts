import {Argument, ChatEnvironment, Command, Permission} from "forge";
import {PrimitiveArgType} from "forge/dist/commands/command";
import {CommandType} from "../general/help";
import CommandContext from "forge/dist/commands/command-context";

type NickArgs = {
    readonly nickname: string;
}

export default class NickCommand extends Command {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "nick",
        description: "Manage nicknames"
    };

    readonly aliases = ["nickname"];

    readonly arguments: Array<Argument> = [
        {
            name: "nickname",
            description: "The desired nickname",
            type: PrimitiveArgType.String,
            required: true
        }
    ];

    constructor() {
        super();

        this.restrict.environment = ChatEnvironment.Guild;
        this.restrict.selfPermissions = [Permission.ManageNicknames];
        this.restrict.issuerPermissions = [Permission.ChangeNickname];
    }

    public async executed(context: CommandContext, args: NickArgs): Promise<void> {
        await context.message.member.setNickname(args.nickname);
    }
};
