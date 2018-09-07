import {exec} from "child_process";
import {Command, CommandContext} from "discord-anvil";
import SpecificGroups from "../specific-groups";
import {CommandType} from "./help";

export default class Build extends Command {
    readonly type = CommandType.Configuration;

    readonly meta = {
        name: "build",
        description: "Build the project"
    };

    constructor() {
        super();

        this.restrict.specific = SpecificGroups.owner;
        this.restrict.cooldown = 5;
    }

    public executed(context: CommandContext): Promise<void> {
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
