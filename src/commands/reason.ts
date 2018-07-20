import { Command, ChatEnvironment, CommandContext } from "discord-anvil";

export default abstract class Reason extends Command {
    readonly meta = {
        name: "reason",
        description: "Manage moderation reasons"
    };

    readonly args = {
        caseNum: "!number",
        reason: "!string"
    };

    readonly restrict = {
        env: ChatEnvironment.Guild,

        specific: [
            "@285578743324606482", // Owner
            "&458130451572457483", // Trial mods
            "&458130847510429720", // Mods
            "&458812900661002260"  // Assistants
        ]
    };

    public executed(context: CommandContext): void {
        // TODO
    }
};
