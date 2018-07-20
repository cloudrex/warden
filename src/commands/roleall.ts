import { Command, CommandContext } from "discord-anvil";

export default abstract class RoleAll extends Command {
    readonly meta = {
        name: "roleall",
        description: "Add a role to all members"
    };

    readonly args = {
        role: "!string"
    };

    public executed(context: CommandContext): void {
        // TODO
    }
};
