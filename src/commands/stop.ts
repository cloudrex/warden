import { Command, CommandContext } from "discord-anvil";

export default class Stop extends Command {
    readonly meta = {
        name: "stop",
        description: "Disconnect the bot"
    };

    readonly aliases = ["disconnect", "quit"];

    readonly restrict = {
        specific: [
            "@285578743324606482" // Owner
        ]
    };

    public async executed (context: CommandContext): Promise<void> {
        await context.ok("Disconnecting.");
        await context.bot.disconnect();
        process.exit(0);
    }
};
