import {Command, CommandContext, RestrictGroup} from "@cloudrex/forge";
import {CommandType} from "../general/help";
import {exec, ExecException} from "child_process";
import os from "os";

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

    public async executed(x: CommandContext): Promise<void> {
        return new Promise<void>(async (resolve) => {
            const platform: string = os.platform();

            if (platform !== "linux") {
                await x.fail(`That command may only be executed in a linux platform; Currently '${platform}' based`);
                resolve();

                return;
            }

            await x.bot.triggerCommand("update", x.msg);
            await x.bot.triggerCommand("build", x.msg);
            await x.ok("Running rebuild script ...");

            exec("bash tasks/rebuild.sh", async (error: ExecException | null, stdout: string) => {
                if (error) {
                    await x.fail(`Rebuild failed (${error.message})`);
                    resolve();

                    return;
                }

                await x.ok("Rebuild completed");
                resolve();
            });
        });
    }
};
