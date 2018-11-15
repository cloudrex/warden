import {Command, CommandContext, RestrictGroup, IArgument, TrivialArgType} from "@cloudrex/forge";
import {CommandType} from "../general/help";

type SelfArgs = {
    readonly property: SelfProperty;
    readonly value: string;
}

type SelfProperty = "username" | "avatar" | "status" | "state";

export default class SelfCommand extends Command<SelfArgs> {
    readonly type = CommandType.Configuration;

    readonly meta = {
        name: "self",
        description: "Manage the bot's details"
    };

    readonly arguments: IArgument[] = [
        {
            name: "property",
            description: "The property to change",
            switchShortName: "p",
            type: TrivialArgType.String,
            required: true
        },
        {
            name: "value",
            description: "The value to apply",
            switchShortName: "v",
            type: TrivialArgType.String,
            required: true
        }
    ];

    readonly restrict: any = {
        specific: [RestrictGroup.BotOwner],
        cooldown: 3
    };

    public async executed(x: CommandContext, args: SelfArgs): Promise<void> {
        let failed: boolean = false;

        switch (args.property) {
            case "username": {
                await x.bot.client.user.setUsername(args.value).catch(async (error: Error) => {
                    failed = true;
                    await x.fail(`I was unable to change my username. (${error.message})`);
                });

                break;
            }

            case "avatar": {
                await x.bot.client.user.setAvatar(args.value).catch(async (error: Error) => {
                    failed = true;
                    await x.fail(`I was unable to change my avatar. (${error.message})`);
                });

                break;
            }

            case "status": {
                await x.bot.client.user.setPresence({
                    game: {
                        name: args.value
                    }
                }).catch(async (error: Error) => {
                    failed = true;
                    await x.fail(`I was unable to change my status. (${error.message})`);
                });

                break;
            }

            default: {
                await x.fail("Invalid property");
            }
        }

        if (!failed) {
            // TODO: Trim value if long
            await x.ok(`:pencil: Successfully set property **${args.property}** to **${args.value}**`);
        }
    }
};
