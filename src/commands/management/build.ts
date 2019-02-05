import {exec} from "child_process";
import {CommandType} from "../general/help";
import {Name, Description, Constraints, Context} from "d.mix";

@Name("build")
@Description("Build the project")
@Constraints({
    specific: [RestrictGroup.BotOwner],
    cooldown: 5
})
export default class extends Command {
    readonly type = CommandType.Configuration;

    readonly meta = {
        name: "build",
        description: "Build the project"
    };

    public run($: Context) {
        return new Promise(async (resolve) => {
            await $.ok("Building the project. This may take a while.");

            exec("npm run build", (error: any, stdOut: string) => {
                if (error) {
                    $.fail(`There was an error while building. (${error.message})`, false);

                    return;
                }

                $.ok(`\`\`\`${stdOut.toString()}\`\`\``);
                resolve();
            });
        });
    }
};
