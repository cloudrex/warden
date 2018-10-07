import {Argument, ChatEnvironment, Command} from "forge";
import {PrimitiveArgType, RestrictGroup} from "forge/dist/commands/command";
import {CommandType} from "../general/help";
import CommandContext from "forge/dist/commands/command-context";

type PurgeArgs = {
    readonly amount: number;
}

export default class PurgeCommand extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "purge",
        description: "Delete messages in bulk"
    };

    readonly arguments: Array<Argument> = [
        {
            name: "amount",
            type: PrimitiveArgType.NonZeroInteger,
            description: "The amount of messages to purge",
            required: true
        }
    ];

    readonly restrict: any = {
        specific: [RestrictGroup.BotOwner],
        environment: ChatEnvironment.Guild
    };
    
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
