import {Command, CommandContext, FormattedMessage, IArgument, TrivialArgType} from "@cloudrex/forge";
import {CommandType} from "./help";
import {IDbUserConfig} from "../../database/mongo-database";
import MemberConfig, {MemberConfigIterator} from "../../core/member-config";
import {table} from "table";

export type OptSubCommand = "tracking";

export type OptArgs = {
    readonly option?: OptSubCommand;
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
            name: "option",
            switchShortName: "o",
            type: TrivialArgType.String,
            required: false
        },
        {
            name: "value",
            switchShortName: "v",
            type: TrivialArgType.String,
            required: false
        }
    ];

    readonly restrict: any = {
        cooldown: 3
    };

    readonly aliases = ["config", "cfg"];

    public async executed(x: CommandContext, args: OptArgs): Promise<void> {
        if (!args.option) {
            const options: IDbUserConfig[] = await MemberConfig.getAll(x.sender.id);
            const iterator: MemberConfigIterator = new MemberConfigIterator(options);

            const tableData: Array<string[]> = [
                ["Option", "Value"],
                ["Tracking", iterator.findValue("tracking", "true")] // TODO: Use default values instead of hard coded
            ];

            await x.msg.channel.send(new FormattedMessage()
                .codeBlock(table(tableData), "scala")
                .build());

            return;
        }

        switch (args.option) {
            case "tracking": {
                if (!args.value) {
                    const result: string | boolean | null = await MemberConfig.get(x.sender.id, "tracking");
                    const value: boolean = (result === null ? true : result) as boolean;

                    await x.ok(value ? "You're currently being tracked" : "You're not being tracked");

                    return;
                }

                if (args.value === "on") {
                    await MemberConfig.set({
                        type: "tracking",
                        userId: x.sender.id,
                        value: true
                    });

                    await x.ok(`Now tracking <@${x.sender.id}>`);
                }
                else if (args.value === "off") {
                    await MemberConfig.set({
                        type: "tracking",
                        userId: x.sender.id,
                        value: false
                    });

                    await x.ok(`No longer tracking <@${x.sender.id}>`);
                }
                else {
                    await x.fail("Invalid tracking state, expecting *on* or *off*");
                }

                break;
            }

            default: {
                x.fail("Invalid subcommand, expecting *tracking*");

                return;
            }
        }
    }
};
