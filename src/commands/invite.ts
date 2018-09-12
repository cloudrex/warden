import {ChatEnvironment, Command, CommandArgument, CommandContext, Permission} from "discord-anvil";
import {CommandType} from "./help";

export default class Invite extends Command {
    readonly type = CommandType.Informational;

    readonly meta = {
        name: "invite",
        description: "Add me to your server"
    };

    constructor() {
        super();

        this.restrict.cooldown = 5;
    }

    public async executed(context: CommandContext): Promise<void> {
        await context.ok(`Thanks for choosing me! [Add with administrator powers](https://discordapp.com/oauth2/authorize?client_id=${context.bot.client.user.id}&scope=bot&permissions=8) or [Add without permissions](https://discordapp.com/oauth2/authorize?client_id=${context.bot.client.user.id}&scope=bot)`);
    }
};
