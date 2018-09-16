import {ChatEnvironment, Command, CommandArgument, CommandContext, Permission} from "discord-anvil";
import {PrimitiveArgumentType} from "discord-anvil/dist/commands/command";
import {CommandType} from "./help";

export interface SayArgs {
    readonly message: string;
}

const mentionPattern: RegExp = /<@!?[0-9]+>|@everyone|@here/gm;

export default class Emulate extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "say",
        description: "Send a message"
    };

    readonly aliases = ["echo"];

    readonly arguments: Array<CommandArgument> = [
        {
            name: "message",
            description: "The message to send",
            type: PrimitiveArgumentType.String,
            required: true
        }
    ];

    constructor() {
        super();

        //this.restrict.ownerOnly = true;
    }

    public async executed(context: CommandContext, args: SayArgs): Promise<void> {
        let filteredMessage: string = args.message;

        while (mentionPattern.test(filteredMessage)) {
            filteredMessage = filteredMessage.replace(mentionPattern, "[Mention]");
        }

        // TODO: Debugging
        await context.message.channel.send(`${context.sender.tag} <:announcement:490726045880811531> ` + filteredMessage);
    }
};
