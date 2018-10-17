import {exec} from "child_process";
import {Command, CommandContext, RestrictGroup} from "@cloudrex/forge";
import {CommandType} from "../general/help";

export default class UpdateCommand extends Command {
    readonly type = CommandType.Configuration;

    readonly meta = {
        name: "update",
        description: "Pull changes from the git repository"
    };

    readonly aliases = ["pull"];

    readonly restrict: any = {
        specific: [RestrictGroup.BotOwner]
    };

    public executed(context: CommandContext): Promise<void> {
        return new Promise((resolve) => {
            exec("git pull", async (error: any, stdOut: string | Buffer) => {
                if (error) {
                    context.fail(`There was an error while pulling changes (${error.message})`, false);

                    return;
                }

                context.ok(`\`\`\`css\n${stdOut}\`\`\``);
                resolve();
            });
        });
    }
};
