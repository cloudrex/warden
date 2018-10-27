import {IArgument, Command, TrivialArgType, CommandContext, RestrictGroup, InternalArgType} from "@cloudrex/forge";
import {CommandType} from "../general/help";

type SayArgs = {
    readonly message: string;
    readonly silent: boolean;
}

const mentionPattern: RegExp = /<@!?[0-9]+>@(?:everyone|here)/gm;

export default class EmulateCommand extends Command<SayArgs> {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "say",
        description: "Send a message"
    };

    readonly aliases = ["echo"];

    readonly arguments: IArgument[] = [
        {
            name: "message",
            description: "The message to send",
            switchShortName: "m",
            type: TrivialArgType.String,
            required: true
        },
        {
            name: "silent",
            description: "Whether to sent the message",
            switchShortName: "s",
            type: TrivialArgType.Boolean,
            required: false,
            defaultValue: false
        }
    ];

    readonly restrict: any = {
        specific: [RestrictGroup.BotOwner]
    };

    public async executed(context: CommandContext, args: SayArgs): Promise<void> {
        if ((args.silent as any) === "true" || args.silent === true) {
            console.log(typeof(args.silent));

            return;
        }

        let filteredMessage: string = args.message;

        while (mentionPattern.test(filteredMessage)) {
            filteredMessage = filteredMessage.replace(mentionPattern, "[Mention]");
        }

        // TODO: Debugging
        await context.message.channel.send(`${context.sender.tag} said ${filteredMessage}`);
    }
};
