import {exec} from "child_process";
import { Command, CommandContext } from "discord-anvil";

export default abstract class Build extends Command {
    readonly meta = {
        name: "build",
        description: "Build the project"
    };

    readonly restrict = {
        specific: [
            "@285578743324606482" // Owner
        ],

        cooldown: 5
    };

    executed(context: CommandContext): Promise<void> {
        return new Promise(async (resolve) => {
            await context.ok("Building the project. This may take a while.");

            exec("yarn build", (error: any, stdOut: string) => {
                if (error) {
                    context.fail(`There was an error while building. (${error.message})`, false);
                }

                context.ok(`\`\`\`${stdOut}\`\`\``);
                resolve();
            });
        });
    }
};
