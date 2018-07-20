import {exec} from "child_process";
import { Command, CommandContext } from "discord-anvil";

export default abstract class Update extends Command {
    readonly meta = {
        name: "update",
        description: "Pull changes from the git repository"
    };

    readonly aliases = ["pull"];

    readonly restrict = {
        specific: [
            "@285578743324606482" // Owner
        ]
    };

    public executed(context: CommandContext): Promise<void> {
        return new Promise((resolve) => {
            exec("git pull", async (error: any, stdOut: string | Buffer) => {
                if (error) {
                    context.fail(`There was an error while pulling changes. (${error.message})`, false);

                    return;
                }

                context.ok(`\`\`\`css\n${stdOut}\`\`\``);
                resolve();
            });
        });
    }
};
