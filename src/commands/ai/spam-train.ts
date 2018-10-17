import {Command, CommandContext, Argument, PrimitiveArgType, RestrictGroup} from "@cloudrex/forge";
import {CommandType} from "../general/help";
import {Message, Snowflake, TextChannel} from "discord.js";
import brain, {NeuralNetwork} from "brain.js";
import fs from "fs";

const excludeAnnouncement = "492139421563355149";

export let loaded: boolean = false;
export let ne: NeuralNetwork | null = null;

type MessageData = {
    spaces: number;
    uppercaseCharacters: number;
    characters: number;
    repeatedCharacters: number;
};

type SpamTrainArgs = {
    readonly spamTest: string;
};

export default class SpamTrain extends Command {
    readonly type = CommandType.Unknown;

    readonly meta = {
        name: "spamtrain",
        description: "Train artificial intelligence for spam detection"
    };

    readonly arguments: Argument[] = [
        {
            name: "spamTest",
            description: "The message to determine if it's a spam",
            required: true,
            type: PrimitiveArgType.String
        }
    ];

    constructor() {
        super();

        this.restrict.specific = [RestrictGroup.BotOwner];
        this.restrict.cooldown = 5;
    }

    public async gatherMessageData(channel: TextChannel, excluded: Snowflake[] = []): Promise<string[]> {
        const messages: Message[] = (await channel.fetchMessages({
            limit: 100
        })).array();

        const totalData: string[] = [];

        for (let i = 0; i < messages.length; i++) {
            // Ignore excluded messages (by id)
            if (excluded.includes(messages[i].id)) {
                continue;
            }

            totalData.push(messages[i].content);
        }

        return totalData;
    }

    private static toTrainDataInputOutput(messages: string[], spammy: boolean = false): any {
        return messages.map((message: string) => {
            return {
                input: message,
                output: spammy ? "spammy" : "normal"
            };
        });
    }

    private async getTrainData(channel: TextChannel, excluded: Snowflake[] = [], spammy: boolean): Promise<any[]> {
        return SpamTrain.toTrainDataInputOutput(await this.gatherMessageData(channel, excluded), spammy);
    }

    public async executed(context: CommandContext, args: SpamTrainArgs): Promise<void> {
        let result: any = "[Unknown]";

        if (!fs.existsSync("./trains/main.json")) {
            const network: NeuralNetwork = new brain.recurrent.LSTM();
            const iterations = 100;
            const perCall = 1;

            let counter = 0;

            const trainingOpts = {
                iterations: iterations,

                callback: () => {
                    counter += perCall;

                    console.log(`Training --> ${counter}/${iterations} (${Math.round((counter / iterations) * 100) / 10}%)`);
                },

                callbackPeriod: perCall
            };

            // Train bad (spammy)
            console.log("Training bad (spammy) ...");

            const badData: any[] = await this.getTrainData(context.message.channel as TextChannel, [context.message.id, excludeAnnouncement], true);

            //network.train(badData, trainingOpts);

            // Train good (normal messages)
            console.log("Training good (non-spammy) ...");

            const goodData: any[] = await this.getTrainData(context.message.guild.channels.get("489543738738081826") as TextChannel, [context.message.id, excludeAnnouncement], false);

            network.train(goodData.concat(badData), trainingOpts);

            console.log("Done training");
            console.log("Running ...");

            console.log(args.spamTest);

            if (!fs.existsSync("./trains")) {
                fs.mkdirSync("./trains");
                console.log("Created trains dir");
            }

            fs.writeFileSync(`./trains/training-${Date.now()}.json`, JSON.stringify(network.toJSON()));
        }
        else if (loaded === true && ne !== null) {
            console.log("Already loaded! Using cache ...");
            result = ne.run(args.spamTest);
        }
        else {
            console.log("Loading from main.json ... ");

            const dat: any = JSON.parse(fs.readFileSync("./trains/main.json").toString());

            ne = new brain.recurrent.LSTM();
            ne.fromJSON(dat);

            loaded = true;

            console.log("Loaded from main.json");

            result = ne.run(args.spamTest);
        }

        await context.ok(`Probability of spam is '${result}'`);
    }
};
