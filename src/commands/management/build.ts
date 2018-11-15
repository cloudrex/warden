import {exec} from "child_process";
import {Command, CommandContext, RestrictGroup} from "@cloudrex/forge";
import {CommandType} from "../general/help";

export default class BuildCommand extends Command {
    readonly type = CommandType.Configuration;

    readonly meta = {
        name: "build",
        description: "Build the project"
    };

    readonly restrict: any = {
        specific: [RestrictGroup.BotOwner],
        cooldown: 5
    };

    public executed(x: CommandContext): Promise<void> {
        return new Promise(async (resolve) => {
            await x.ok("Building the project. This may take a while.");

            exec("npm run build", (error: any, stdOut: string) => {
                if (error) {
                    x.fail(`There was an error while building. (${error.message})`, false);

                    return;
                }

                x.ok(`\`\`\`${stdOut.toString()}\`\`\``);
                resolve();
            });
        });
    }
};
