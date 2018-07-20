import SpecificGroups from "../specific-groups";
import { Command, Permission, CommandContext } from "discord-anvil";

const request = require("request").defaults({
    encoding: null
});

export default abstract class Emoji extends Command {
    readonly meta = {
        name: "emoji",
        description: "Add an emoji to the guild"  
    };

    readonly args = {
        name: "!string",
        url: "!string"
    };

    readonly restrict = {
        specific: SpecificGroups.staff,
        selfPerms: [Permission.ManageEmojis]
    };

    executed(context: CommandContext): Promise<void> {
        return new Promise((resolve) => {
            request.get(context.arguments[1], async (error: Error, response: any, body: any) => {
                await context.message.guild.createEmoji(body, context.arguments[0], undefined, `Requested by ${context.sender.tag} (${context.sender.id})`);
                await context.ok(`Emoji **${context.arguments[0]}** successfully created.`);
                resolve();
            });
        });
    }
};
