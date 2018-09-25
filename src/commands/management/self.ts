import {Command, CommandContext} from "discord-anvil";
import {Argument, PrimitiveArgType} from "discord-anvil/dist";
import {CommandType} from "../general/help";
import {RestrictGroup} from "discord-anvil/dist/commands/command";

type SelfArgs = {
    readonly property: SelfProperty;
    readonly value: string;
}

type SelfProperty = "username" | "avatar" | "status" | "state";

export default class SelfCommand extends Command {
    readonly type = CommandType.Configuration;

    readonly meta = {
        name: "self",
        description: "Manage the bot's details"
    };

    readonly arguments: Array<Argument> = [
        {
            name: "property",
            description: "The property to change",
            type: PrimitiveArgType.String,
            required: true
        },
        {
            name: "value",
            description: "The value to apply",
            type: PrimitiveArgType.String,
            required: true
        }
    ];

    readonly restrict: any = {
        specific: [RestrictGroup.BotOwner]
    };

    public async executed(context: CommandContext, args: SelfArgs): Promise<void> {
        let failed: boolean = false;

        switch (args.property) {
            case "username": {
                await context.bot.client.user.setUsername(args.value).catch(async (error: Error) => {
                    failed = true;
                    await context.fail(`I was unable to change my username. (${error.message})`);
                });

                break;
            }

            case "avatar": {
                await context.bot.client.user.setAvatar(args.value).catch(async (error: Error) => {
                    failed = true;
                    await context.fail(`I was unable to change my avatar. (${error.message})`);
                });

                break;
            }

            case "status": {
                await context.bot.client.user.setPresence({
                    game: {
                        name: args.value
                    }
                }).catch(async (error: Error) => {
                    failed = true;
                    await context.fail(`I was unable to change my status. (${error.message})`);
                });

                break;
            }

            default: {
                await context.fail("Invalid property");
            }
        }

        if (!failed) {
            // TODO: Trim value if long
            await context.ok(`:pencil: Successfully set property **${args.property}** to **${args.value}**`);
        }
    }
};
