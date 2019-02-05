import {CommandType} from "../general/help";
import {Name, Description, Arguments, Constraints, ChatEnv, Context, Type} from "d.mix";

const request: any = require("request").defaults({
    encoding: null
});

type ILocalArgs = {
    readonly name: string;
    readonly url: string;
}

@Name("emoji")
@Description("Add an emoji to the guild")
@Arguments(
    {
        name: "name",
        description: "The name of the emoji to add",
        switchShortName: "n",
        type: Type.String,
        required: true
    },
    {
        name: "url",
        description: "The URL to the emoji image",
        switchShortName: "u",
        type: Type.String,
        required: true
    }
)
@Constraints({
    specific: [RestrictGroup.ServerModerator],
    selfPermissions: [Permission.ManageEmojis],
    issuerPermissions: [Permission.ManageEmojis],
    environment: ChatEnv.Guild
})
export default class extends Command {
    readonly type = CommandType.Utility;

    public run($: Context, args: ILocalArgs) {
        return new Promise((resolve) => {
            request.get(args.url, async (error: Error, response: any, body: any) => {
                await $.msg.guild.createEmoji(body, args.name, undefined, `Requested by ${$.sender.tag} (${$.sender.id})`);
                await $.ok(`Emoji **${args.name}** successfully created.`);
                resolve();
            });
        });
    }
};
