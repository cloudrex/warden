import {Command, CommandContext} from "discord-anvil";
import {CommandType} from "./help";
import {CommandArgument, PrimitiveArgumentType} from "discord-anvil/dist";
import WardenAPI from "../../core/warden-api";

export type OptSubCommand = "tracking";

export type OptArgs = {
    readonly subCommand: OptSubCommand;
    readonly value?: string;
};

export default class Opt extends Command {
    readonly type = CommandType.Configuration;

    readonly meta = {
        name: "opt",
        description: "Configure the bot"
    };

    readonly arguments: Array<CommandArgument> = [
        {
            name: "subCommand",
            type: PrimitiveArgumentType.String,
            required: true
        },
        {
            name: "value",
            type: PrimitiveArgumentType.String,
            required: false
        }
    ];

    readonly aliases = ["config", "cfg"];

    public async executed(context: CommandContext, args: OptArgs): Promise<void> {
        switch (args.subCommand) {
            case "tracking": {
                if (!args.value) {
                    const result: string | boolean | null = await WardenAPI.getUserConfig(context.sender.id, "tracking");
                    const value: boolean = (result === null ? true : result) as boolean;

                    await context.ok(value ? "You're currently being tracked" : "You're not being tracked");

                    return;
                }

                if (args.value === "on") {
                    await WardenAPI.setUserConfig({
                        type: "tracking",
                        userId: context.sender.id,
                        value: true
                    });

                    await context.ok(`Now tracking <@${context.sender.id}>`);
                }
                else if (args.value === "off") {
                    await WardenAPI.setUserConfig({
                        type: "tracking",
                        userId: context.sender.id,
                        value: false
                    });

                    await context.ok(`No longer tracking <@${context.sender.id}>`);
                }
                else {
                    await context.fail("Invalid tracking state, expecting *on* or *off*");
                }

                break;
            }

            default: {
                context.fail("Invalid subcommand, expecting *tracking*");

                return;
            }
        }
    }
};
