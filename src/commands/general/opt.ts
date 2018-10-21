import {Command, CommandContext, FormattedMessage, IArgument, PrimitiveArgType} from "@cloudrex/forge";
import {CommandType} from "./help";
import {DatabaseUserConfig} from "../../database/mongo-database";
import MemberConfig, {MemberConfigIterator} from "../../core/member-config";
import {table} from "table";

export type OptSubCommand = "tracking";

export type OptArgs = {
    readonly subCommand?: OptSubCommand;
    readonly value?: string;
};

// TODO: Mentions getting filtered
export default class OptCommand extends Command<OptArgs> {
    readonly type = CommandType.Configuration;

    readonly meta = {
        name: "opt",
        description: "Configure the bot"
    };

    readonly arguments: IArgument[] = [
        {
            name: "subCommand",
            type: PrimitiveArgType.String,
            required: false
        },
        {
            name: "value",
            type: PrimitiveArgType.String,
            required: false
        }
    ];

    readonly restrict: any = {
        cooldown: 3
    };

    readonly aliases = ["config", "cfg"];

    public async executed(context: CommandContext, args: OptArgs): Promise<void> {
        if (!args.subCommand) {
            const options: DatabaseUserConfig[] = await MemberConfig.getAll(context.sender.id);
            const iterator: MemberConfigIterator = new MemberConfigIterator(options);

            const tableData: Array<string[]> = [
                ["Option", "Value"],
                ["Tracking", iterator.findValue("tracking", "true")] // TODO: Use default values instead of hard coded
            ];

            await context.message.channel.send(new FormattedMessage()
                .codeBlock(table(tableData), "scala")
                .build());

            return;
        }

        switch (args.subCommand) {
            case "tracking": {
                if (!args.value) {
                    const result: string | boolean | null = await MemberConfig.get(context.sender.id, "tracking");
                    const value: boolean = (result === null ? true : result) as boolean;

                    await context.ok(value ? "You're currently being tracked" : "You're not being tracked");

                    return;
                }

                if (args.value === "on") {
                    await MemberConfig.set({
                        type: "tracking",
                        userId: context.sender.id,
                        value: true
                    });

                    await context.ok(`Now tracking <@${context.sender.id}>`);
                }
                else if (args.value === "off") {
                    await MemberConfig.set({
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
