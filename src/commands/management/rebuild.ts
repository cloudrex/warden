import {CommandType} from "../general/help";
import {exec, ExecException} from "child_process";
import os from "os";
import {RestrictGroup, Context} from "d.mix";

export default class RebuildCommand extends Command {
    readonly type = CommandType.Configuration;

    readonly peerCommands: string[] = ["cloudrex@outlook.com/build:^1.0.0"];

    readonly meta = {
        name: "rebuild",
        description: "Rebuild the project"
    };

    readonly restrict: any = {
        specific: [RestrictGroup.BotOwner],
        cooldown: 5
    };

    public async executed($: Context) {
        return new Promise<void>(async (resolve) => {
            const platform: string = os.platform();

            if (platform !== "linux") {
                await $.fail(`That command may only be executed in a linux platform; Currently '${platform}' based`);
                resolve();

                return;
            }

            await $.bot.triggerCommand("update", $.msg);
            await $.bot.triggerCommand("build", $.msg);
            await $.ok("Running rebuild script ...");

            exec("bash tasks/rebuild.sh", async (error: ExecException | null, stdout: string) => {
                if (error) {
                    await $.fail(`Rebuild failed (${error.message})`);
                    resolve();

                    return;
                }

                await $.ok("Rebuild completed");
                resolve();
            });
        });
    }
};
