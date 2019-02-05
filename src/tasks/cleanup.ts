import AntiRaidService from "../services/anti-raid";
import {Name, Description, Bot, Log} from "d.mix";

@Name("cleanup")
@Description("Cleanup junk")
export default class CleanupTask extends Task {
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
