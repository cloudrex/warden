import {WardenAPI} from "../warden-api";
import {RichEmbed, TextChannel} from "discord.js";
import { Command, CommandContext, SetupHelper, SetupHelperResult } from "discord-anvil";

export default class Embed extends Command {
    readonly meta = {
        name: "embed",
        description: "Create an embed"
    };

    constructor() {
        super();

        this.restrict.specific = ["@285578743324606482"]; // Owner
    }

    public async executed(context: CommandContext, api: WardenAPI): Promise<void> {
        const setup: SetupHelper | null = SetupHelper.fromContext({
            context: context,
            title: "Create Embed"
        });

        if (!setup) {
            await context.fail("Operation failed. (Unable to create SetupHelper instance)");

            return;
        }

        const result: SetupHelperResult = await setup
            .input("Where would you like to post the embed?")
            .input("What will the embed contain?")
            .input("What color will the embed be?")
            .finish();

        const channel = api.getChannel(result.responses[0]);

        if (!channel || !(channel instanceof TextChannel)) {
            await context.fail("Channel does not exist or it is not a text channel.");

            return;
        }

        channel.send(new RichEmbed()
            .setDescription(result.responses[1])
            .setColor(result.responses[2].toUpperCase()));
    }
};
