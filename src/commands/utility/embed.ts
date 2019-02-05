import WardenAPI from "../../core/warden-api";
import {RichEmbed, TextChannel} from "discord.js";
import {CommandType} from "../general/help";
import {Name, Description, Constraints, ChatEnv, Context, SetupHelper, Command, RestrictGroup, ISetupHelperResult, Utils} from "d.mix";

@Name("embed")
@Description("Create an embed message")
@Constraints({
    specific: [RestrictGroup.ServerOwner],
    cooldown: 5,
    environment: ChatEnv.Guild
})
export default class EmbedCommand extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "embed",
        description: "Create an embed"
    };

    readonly restrict: any = {

    };

    public async run($: Context, api: WardenAPI) {
        const setup: SetupHelper | null = SetupHelper.fromContext({
            context: $,
            title: "Create Embed"
        });

        if (setup === null) {
            await $.fail("Operation failed. (Unable to create SetupHelper instance)");

            return;
        }

        const result: ISetupHelperResult = await setup
            .input("Where would you like to post the embed?")
            .input("What will the embed contain?")
            .input("What color will the embed be?")
            .finish();

        const channel: TextChannel | null = ($.msg.guild.channels.get(Utils.resolveId(result.responses[0])) as TextChannel | undefined) || null;

        if (channel === null) {
            await $.fail("Channel does not exist or it is not a text channel");

            return;
        }

        await channel.send(new RichEmbed()
            .setDescription(result.responses[1])
            .setColor(result.responses[2].toUpperCase()));
    }
};
