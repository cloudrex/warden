import {Argument, ChatEnvironment, Command, Permission} from "discord-anvil";
import {PrimitiveArgType} from "discord-anvil/dist/commands/command";
import {CommandType} from "../general/help";
import CommandContext from "discord-anvil/dist/commands/command-context";

export interface NickArgs {
    readonly nickname: string;
}

export default class Nick extends Command {
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
