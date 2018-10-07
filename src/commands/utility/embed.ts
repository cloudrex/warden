import WardenAPI from "../../core/warden-api";
import {RichEmbed, TextChannel} from "discord.js";
import {Command, SetupHelper, SetupHelperResult} from "forge";
import {CommandType} from "../general/help";
import {RestrictGroup} from "forge/dist/commands/command";
import Utils from "forge/dist/core/utils";
import CommandContext from "forge/dist/commands/command-context";

export default class EmbedCommand extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "embed",
        description: "Create an embed"
    };

    constructor() {
        super();

        this.restrict.cooldown = 5;
        this.restrict.specific = [RestrictGroup.ServerModerator];
    }

    public async executed(context: CommandContext, api: WardenAPI): Promise<void> {
        const setup: SetupHelper | null = SetupHelper.fromContext({
            context: context,
            title: "Create Embed"
        });

        if (setup === null) {
            await context.fail("Operation failed. (Unable to create SetupHelper instance)");

            return;
        }

        const result: SetupHelperResult = await setup
            .input("Where would you like to post the embed?")
            .input("What will the embed contain?")
            .input("What color will the embed be?")
            .finish();

        const channel: TextChannel | null = (context.message.guild.channels.get(Utils.resolveId(result.responses[0])) as TextChannel | undefined) || null;

        if (channel === null) {
            await context.fail("Channel does not exist or it is not a text channel");

            return;
        }

        await channel.send(new RichEmbed()
            .setDescription(result.responses[1])
            .setColor(result.responses[2].toUpperCase()));
    }
};
