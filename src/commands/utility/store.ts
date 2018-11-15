import {Command, CommandContext, Utils, IArgument, TrivialArgType, ChatEnvironment} from "@cloudrex/forge";
import {Snowflake} from "discord.js";
import {CommandType} from "../general/help";
import {IDbStoredMessage} from "../../database/mongo-database";
import StoredMessages from "../../core/stored-messages";

type StoreArgs = {
    readonly messageId?: Snowflake;
    readonly name?: string;
}

// TODO: Limit amount of messages to 50?
export default class StoreCommand extends Command<StoreArgs> {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "store",
        description: "Save and retrieve specific messages"
    };

    readonly aliases = ["save"];

    readonly arguments: IArgument[] = [
        {
            name: "name",
            description: "The identifier",
            switchShortName: "n",
            required: false,
            type: TrivialArgType.String
        },
        {
            name: "messageId",
            switchShortName: "i",
            type: TrivialArgType.String,
            description: "The Id of the message to save",
            required: false
        }
    ];

    readonly restrict: any = {
        cooldown: 5,
        environment: ChatEnvironment.Guild
    };

    public async executed(x: CommandContext, args: StoreArgs): Promise<void> {
        if (args.messageId === undefined || args.name === undefined) {
            if (args.messageId === undefined && args.name === undefined) {
                const storedMessages: IDbStoredMessage[] | null = await StoredMessages.getAllByUser(x.sender.id);

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

                await x.ok(response);
            }
            else if (args.messageId === undefined && args.name !== undefined) {
                const storedMessage: IDbStoredMessage | null = await StoredMessages.getByName(x.sender.id, args.name);

                if (storedMessage !== null) {
                    await x.ok(`(${Utils.timeAgo(storedMessage.time)}) **${storedMessage.authorTag}** <:announcement:490726045880811531> ${storedMessage.message}`)
                }
                else {
                    await x.fail("There's no stored message assosiated with that name");
                }
            }
            else {
                await x.fail("Unknown error, this shouldn't happen (432)");
            }

            return;
        }

        if (await StoredMessages.existsByUserId(x.sender.id, args.name)) {
            await x.fail("You've already saved a message using that identifier, please use a different one");

            return;
        }

        if (await StoredMessages.addByMessageId(x.sender, args.name, args.messageId) === false) {
            await x.fail("The specified message does not exist or was not recorded");

            return;
        }

        await x.ok("Successfully saved message into the database");
    }
};
