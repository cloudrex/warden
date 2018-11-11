import {Task, Bot, Log, IFragmentMeta} from "@cloudrex/forge";
import AntiRaidService from "../services/anti-raid";

export default class CleanupTask extends Task {
    readonly meta: IFragmentMeta = {
        name: "cleanup",
        description: "Cleanup junk"
    };

    public constructor(bot: Bot) {
        super(bot);

        if (this.bot.client.user) {
            let interval: number = this.bot.client.guilds.size / 10;

            if (interval < 3) {
                interval = 3;
            }

            (this.interval as any) = interval * 600000; // Minutes
        }
    }

    public run(): void {
        Log.info("[CleanupService] Cleaning up ...");
        AntiRaidService.memory.clear();
    }
}