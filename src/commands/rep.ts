import {ChatEnvironment, Command, CommandArgument, CommandContext, Permission} from "discord-anvil";
import {GuildMember} from "discord.js";
import Reputation from "../core/reputation";

export type RepArgs = {
    readonly member?: GuildMember;
}

export default class Rep extends Command {
    readonly meta = {
        name: "rep",
        description: "Give reputation to a user"
    };

    readonly arguments: Array<CommandArgument> = [
        {
            name: "member",
            description: "The target member",
            type: "member",
            required: false
        }
    ];

    constructor() {
        super();

        this.restrict.environment = ChatEnvironment.Guild;
        this.restrict.cooldown = 3600;
    }

    public async executed(context: CommandContext, args: RepArgs): Promise<void> {
        if (args.member === undefined) {
            const rep: number = await Reputation.getReputation(context.sender.id);

            console.log(rep);

            await context.ok(`You have **${rep > 0 ? `+${rep}` : rep}** reputation`);

            return;
        }

        await Reputation.increaseReputation(args.member.id);
    }
};
