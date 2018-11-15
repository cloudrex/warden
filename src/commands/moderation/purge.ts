import {IArgument, ChatEnvironment, Command, CommandContext, TrivialArgType, RestrictGroup} from "@cloudrex/forge";
import {CommandType} from "../general/help";
import {Message} from "discord.js";

type PurgeArgs = {
    readonly amount: number;
    readonly pattern?: string;
}

export default class PurgeCommand extends Command<PurgeArgs> {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "purge",
        description: "Delete messages in bulk"
    };

    readonly arguments: IArgument[] = [
        {
            name: "amount",
            type: TrivialArgType.NonZeroInteger,
            switchShortName: "a",
            description: "The amount of messages to purge",
            required: true
        },
        {
            name: "pattern",
            type: TrivialArgType.String,
            switchShortName: "p",
            description: "The pattern to match the messages to be purged",
            required: false,
            defaultValue: undefined
        }
    ];

    readonly restrict: any = {
        specific: [RestrictGroup.BotOwner],
        cooldown: 3,
        environment: ChatEnvironment.Guild
    };

    private purging: boolean = false;

    // TODO: Return type, should be void
    public async executed(x: CommandContext, args: PurgeArgs): Promise<any> {
        return new Promise(async (resolve) => {
            if (this.purging) {
                await x.fail("Please wait for the current purging to finish");
                resolve();

                return;
            }
            else if (args.amount > 50) {
                await x.fail("Amount must be lower or equal to 50");
                resolve();

                return;
            }

            this.purging = true;

            // TODO: Fix incompatibility with autoDeleteCommand? Something's wrong
            const messages: Message[] = (await x.msg.channel.fetchMessages({
                limit: args.amount
            })).array();

            let deleted: number = 0;
            let pattern: RegExp | null = null;

            if (args.pattern) {
                let flags: string | undefined = undefined;
                let flagsSplit: string[] = args.pattern.split(/[^\\]\//);

                if (flagsSplit.length > 1) {
                    flags = flagsSplit[1];
                }

                pattern = new RegExp(args.pattern, flags);
            }

            for (let i: number = 0; i < args.amount; i++) {
                if (messages[i] && messages[i].deletable) {
                    if (pattern && !pattern.test(messages[i].content)) {
                        continue;
                    }

                    await messages[i].delete();
                    deleted++;
                }
            }

            const response: Message = await x.ok(`Deleted ${deleted}/${args.amount} message(s)`) as any;

            if (response && response.deletable) {
                await response.delete(4000);
            }

            this.purging = false;

            resolve();
        });
    }
};
