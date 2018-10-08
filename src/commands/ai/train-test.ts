import {ChatEnvironment, Command, CommandContext, Permission} from "forge";
import {CommandType} from "../general/help";
import {Message, Snowflake, TextChannel} from "discord.js";
import {Argument, PrimitiveArgType, RestrictGroup} from "forge/dist/commands/command";
import brain, {NeuralNetwork} from "brain.js";
import fs from "fs";

const excludeAnnouncement = "492139421563355149";

export let _loaded: boolean = false;
export let _ne: NeuralNetwork | null = null;

type MessageData = {
    spaces: number;
    uppercaseCharacters: number;
    characters: number;
    repeatedCharacters: number;
};

type TrainTestArgs = {
    readonly spamTest: string;
};

export default class TrainTest extends Command {
    readonly type = CommandType.Unknown;

    readonly meta = {
        name: "traintest",
        description: "Train artificial intelligence for spam detection"
    };

    readonly arguments: Array<Argument> = [
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

    public async gatherMessageData(channel: TextChannel, excluded: Array<Snowflake> = []): Promise<string[]> {
        const messages: Array<Message> = (await channel.fetchMessages({
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

    private async getTrainData(channel: TextChannel, excluded: Array<Snowflake> = [], spammy: boolean): Promise<Array<any>> {
        return TrainTest.toTrainDataInputOutput(await this.gatherMessageData(channel, excluded), spammy);
    }

    public async executed(context: CommandContext, args: TrainTestArgs): Promise<void> {
        if (!_loaded) {
            _ne = new brain.NeuralNetwork();

            const dat: any = JSON.parse(fs.readFileSync("test-training.json").toString());

            console.log("Training ...");

            const iter: number = 25;
            const inc: number = 1;

            let counter: number = 0;

            _ne.train(dat, {
                iterations: iter,
                callbackPeriod: inc,

                callback: () => {
                    counter += inc;

                    console.log(`Training ==> ${counter}/${iter}`);
                }
            });

            console.log("Finished training");
            _loaded = true;
        }

        const result: string = (_ne as NeuralNetwork).run(args.spamTest);

        console.log("result is ", result);

        await context.ok(`I guess that your message is about **${result}**`);
    }
};
