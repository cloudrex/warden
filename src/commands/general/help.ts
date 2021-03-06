import {Command, CommandContext} from "@cloudrex/forge";

export enum CommandType {
    Utility = "tools",
    Moderation = "crown",
    Configuration = "wrench",
    Fun = "sparkles",
    Music = "musical_note",
    Unknown = "grey_question",
    Informational = "information_source"
}

export default class HelpCommand extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "help",
        description: "View all available commands"
    };

    public async executed(context: CommandContext): Promise<void> {
        // TODO: Broken by decorator commands
        /* let commands: string = context.bot.commandStore.commands
            .map((command: Command) => `${(command as any).type !== undefined ? `:${(command as any).type}:` : `:${CommandType.Unknown}:`} **${command.meta.name}**: ${command.meta.description}`)
            .join("\n");

        if (commands.length > 2048) {
            commands = commands.substring(0, 2044) + " ...";
        }

        if (context.bot.options.dmHelp) {
            await (await context.sender.createDM()).send(new RichEmbed()
                .setColor("GREEN")
                .setDescription(commands)).catch(async (error: Error) => {
                if (error.message === "Cannot send messages to this user") {
                    await context.fail("You're not accepting direct messages");
                }
                else {
                    await context.fail(`I was unable to send you my commands (${error.message})`);
                }
            });
        }
        else {
            await context.ok(commands, "Help - Available Commands");
        } */

        await context.fail("Command is currently broken");
    }
};
