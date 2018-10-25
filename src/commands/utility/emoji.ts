import {Command, CommandContext, Permission, RestrictGroup, TrivialArgType, ChatEnvironment} from "@cloudrex/forge";
import {CommandType} from "../general/help";

const request: any = require("request").defaults({
    encoding: null
});

type EmojiArgs = {
    readonly name: string;
    readonly url: string;
}

export default class EmojiCommand extends Command<EmojiArgs> {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "emoji",
        description: "Add an emoji to the guild"
    };

    readonly arguments = [
        {
            name: "name",
            description: "The name of the emoji to add",
            type: TrivialArgType.String,
            required: true
        },
        {
            name: "url",
            description: "The URL to the emoji image",
            type: TrivialArgType.String,
            required: true
        }
    ];

    readonly restrict: any = {
        specific: [RestrictGroup.ServerModerator],
        selfPermissions: [Permission.ManageEmojis],
        issuerPermissions: [Permission.ManageEmojis],
        environment: ChatEnvironment.Guild
    };

    public executed(context: CommandContext, args: EmojiArgs): Promise<void> {
        return new Promise((resolve) => {
            request.get(args.url, async (error: Error, response: any, body: any) => {
                await context.message.guild.createEmoji(body, args.name, undefined, `Requested by ${context.sender.tag} (${context.sender.id})`);
                await context.ok(`Emoji **${args.name}** successfully created.`);
                resolve();
            });
        });
    }
};
