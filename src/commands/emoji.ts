import {Command, CommandContext, Permission} from "discord-anvil";
import {CommandRestrictGroup, PrimitiveArgumentType} from "discord-anvil/dist/commands/command";
import {CommandType} from "./help";

const request = require("request").defaults({
    encoding: null
});

export interface EmojiArgs {
    readonly name: string;
    readonly url: string;
}

export default class Emoji extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "emoji",
        description: "Add an emoji to the guild"
    };

    readonly arguments = [
        {
            name: "name",
            description: "The name of the emoji to add",
            type: PrimitiveArgumentType.String,
            required: true
        },
        {
            name: "url",
            description: "The URL to the emoji image",
            type: PrimitiveArgumentType.String,
            required: true
        }
    ];

    constructor() {
        super();

        this.restrict.specific = [CommandRestrictGroup.ServerModerator];
        this.restrict.selfPermissions = [Permission.ManageEmojis];
    }

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
