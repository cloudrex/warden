import {Argument, Command, PrimitiveArgType, CommandContext} from "forge";
import {CommandType} from "../general/help";

type SayArgs = {
    readonly message: string;
}

const mentionPattern: RegExp = /<@!?[0-9]+>|@everyone|@here/gm;

export default class EmulateCommand extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "say",
        description: "Send a message"
    };

    readonly aliases = ["echo"];

    readonly arguments: Argument[] = [
        {
            name: "message",
            description: "The message to send",
            type: PrimitiveArgType.String,
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
