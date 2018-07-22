import { CommandContext, Command } from "discord-anvil";

export default class Purge extends Command {
    readonly meta = {
        name: "purge",
        description: "Delete messages in bulk"
    };

    readonly args = {
        amount: "!number"
    };

    readonly restrict = {
        specific: [
            "@285578743324606482" // Owner
        ]
    };

    // TODO: Return type, should be void
    public async executed(context: CommandContext): Promise<any> {
        return new Promise((resolve) => {
            if (context.arguments[0] < 1) {
                context.fail("Amount must be 1 or higher.");
                resolve();

                return;
            }

            // TODO: Fix incompatibility with autoDeleteCommand? Something's wrong
            context.message.channel.bulkDelete(context.arguments[0]).then(() => {
                resolve();
            }).catch((error: Error) => {
                context.fail(`Operation failed. (${error.message})`, false);

                resolve();
            });
        });
    }
};
