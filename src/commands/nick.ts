import { Command, Permission, CommandContext, CommandArgument, ChatEnvironment } from "discord-anvil";
import { PrimitiveArgumentType } from "discord-anvil/dist/commands/command";

export interface NickArgs {
    readonly nickname: string;
}

export default class Nick extends Command {
    readonly meta = {
        name: "nick",
        description: "Manage nicknames"
    };

    readonly aliases = ["nickname"];

    readonly arguments: Array<CommandArgument> = [
        {
            name: "nickname",
            description: "The desired nickname",
            type: PrimitiveArgumentType.String,
            required: true
        }
    ];

    constructor() {
        super();

        this.restrict.environment = ChatEnvironment.Guild;
        this.restrict.selfPermissions = [Permission.ChangeNickname];
    }

    public async executed(context: CommandContext, args: NickArgs): Promise<void> {
        await context.message.member.setNickname(args.nickname);
    }
};
