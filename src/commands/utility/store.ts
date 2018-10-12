import {Command, CommandContext, Utils} from "forge";
import {Snowflake} from "discord.js";
import {CommandType} from "../general/help";
import {DatabaseStoredMessage} from "../../database/mongo-database";
import {Argument, PrimitiveArgType} from "forge/dist/commands/command";
import StoredMessages from "../../core/stored-messages";

type StoreArgs = {
    readonly messageId?: Snowflake;
    readonly name?: string;
}

export default class StoreCommand extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "store",
        description: "Save and retrieve specific messages"
    };

    readonly aliases = ["save"];

    readonly arguments: Argument[] = [
        {
            name: "name",
            required: false,
            type: PrimitiveArgType.String
        },
        {
            name: "messageId",
            type: PrimitiveArgType.String,
            description: "The Id of the message to save",
            required: false
        }
    ];

    constructor() {
        super();

        this.restrict.cooldown = 5;
    }

    public async executed(context: CommandContext, args: StoreArgs): Promise<void> {
        if (args.messageId === undefined || args.name === undefined) {
            if (args.messageId === undefined && args.name === undefined) {
                const storedMessages: DatabaseStoredMessage[] | null = await StoredMessages.getAllByUser(context.sender.id);

                let response: string = "";

                if (storedMessages === null) {
                    response = "You haven't stored any messages yet";
                }
                else {
                    for (let i = 0; i < storedMessages.length; i++) {
                        if (i !== 0) {
                            response += "\n";
                        }

                        response += `**${storedMessages[i].name}** ${Utils.timeAgo(storedMessages[i].time)}`;
                    }
                }

                await context.ok(response);
            }
            else if (args.messageId === undefined && args.name !== undefined) {
                const storedMessage: DatabaseStoredMessage | null = await StoredMessages.getByName(context.sender.id, args.name);

                if (storedMessage !== null) {
                    await context.ok(`(${Utils.timeAgo(storedMessage.time)}) **${storedMessage.authorTag}** <:announcement:490726045880811531> ${storedMessage.message}`)
                }
                else {
                    await context.fail("There's no stored message assosiated with that name");
                }
            }
            else {
                await context.fail("Unknown error, this shouldn't happen (432)");
            }

            return;
        }

        if (await StoredMessages.existsByUserId(context.sender.id, args.name)) {
            await context.fail("You've already saved a message using that identifier, please use a different one");

            return;
        }

        if (await StoredMessages.addByMessageId(context.sender, args.name, args.messageId) === false) {
            await context.fail("The specified message does not exist or was not recorded");

            return;
        }

        await context.ok("Successfully saved message into the database");
    }
};
