import { Command, Permission, CommandContext } from "discord-anvil";

export default class Nick extends Command {
    readonly meta = {
        name: "nick",
        description: "Manage nicknames"
    };

    readonly aliases = ["nickname"];

    readonly args = {
        name: "!string"
    };

    readonly restrict = {
        selfPerms: [Permission.ManageNicknames]
    };

    public async executed(context: CommandContext): Promise<void> {
        await context.message.member.setNickname(context.arguments[0]);
    }
};
