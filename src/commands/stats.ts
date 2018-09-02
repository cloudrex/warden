import {Command, CommandContext} from "discord-anvil";
import SpecificGroups from "../specific-groups";
import {Attachment} from "discord.js";
import Charts from "../charts";
import {DatabaseMessage} from "../database/database-entities";
import {WardenAPI} from "../warden-api";

function getBeforeDate(amount: number): Date {
    const today: Date = new Date();
    const result: Date = new Date(today);

    result.setDate(today.getDate() - (amount + 1));

    return result;
}

function getDateString(date: Date): string {
    return `${date.getMonth()}/${date.getDate()}`;
}

function getDay(amount: number): string {
    return getDateString(getBeforeDate(amount));
}

export default class Stats extends Command {
    readonly meta = {
        name: "stats",
        description: "View message statistics"
    };

    constructor() {
        super();

        this.restrict.specific = SpecificGroups.owner;
    }

    // TODO: Add missing extra days data
    public async executed(context: CommandContext): Promise<void> {
        const api: WardenAPI = context.bot.getAPI();

        const extra = {
            today: await api.db.getMultiple<DatabaseMessage>(api.db.getConnection()("messages")
                .where("time", ">", Date.now() - 86400000)),

            yesterday: await api.db.getMultiple<DatabaseMessage>(api.db.getConnection()("messages")
                .where("time", "<", Date.now() - 86400000)
                .andWhere("time", ">", Date.now() - 172800000))
        };

        // Always before yesterday
        const days = [
            getDay(1),
            getDay(2),
        ];

        const messagesData: any = {
            labels: ["Today", "Yesterday", ...days],

            datasets: [
                {
                    label: "Messages",
                    data: [extra.today.length, extra.yesterday.length],

                    backgroundColor: [
                        "rgba(255, 99, 132, 0.2)",
                        "rgba(54, 162, 235, 0.2)"
                    ],

                    borderColor: [
                        "rgba(255,99,132,1)",
                        "rgba(54, 162, 235, 1)"
                    ],

                    borderWidth: 1
                }
            ]
        };

        await context.message.channel.send(new Attachment(await Charts.createMessages(messagesData), "stats.png"));
    }
};
