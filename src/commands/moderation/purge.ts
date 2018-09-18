import {ChatEnvironment, Command, CommandArgument, CommandContext} from "discord-anvil";
import {CommandRestrictGroup, PrimitiveArgumentType} from "discord-anvil/dist/commands/command";
import {CommandType} from "../general/help";

export interface PurgeArgs {
    readonly amount: number;
}

export default class Purge extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "purge",
        description: "Delete messages in bulk"
    };

    readonly arguments: Array<CommandArgument> = [
        {
            name: "amount",
            type: PrimitiveArgumentType.NonZeroInteger,
            description: "The amount of messages to purge",
            required: true
        }
    ];

    constructor() {
        super();

        this.restrict.environment = ChatEnvironment.Guild;
        this.restrict.specific = [CommandRestrictGroup.BotOwner];
    }

    // TODO: Return type, should be void
    public async executed(context: CommandContext, args: PurgeArgs): Promise<any> {
        return new Promise(async (resolve) => {
            if (args.amount > 20) {
                await context.fail("Amount must be lower than 20");
                resolve();

                return;
            }

            // TODO: Fix incompatibility with autoDeleteCommand? Something's wrong
            context.message.channel.bulkDelete(args.amount + 1).then(() => {
                resolve();
            }).catch(async (error: Error) => {
                await context.fail(`Operation failed (${error.message})`, false);

                resolve();
            });
        });
    }
};
