import {exec} from "child_process";
import {Command, CommandContext} from "discord-anvil";
import SpecificGroups from "../specific-groups";
import {CommandType} from "./help";

export default class Update extends Command {
    readonly type = CommandType.Configuration;

    readonly meta = {
        name: "update",
        description: "Pull changes from the git repository"
    };

    readonly aliases = ["pull"];

    constructor() {
        super();

        this.restrict.specific = SpecificGroups.owner;
    }

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
