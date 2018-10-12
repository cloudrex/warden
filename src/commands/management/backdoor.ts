import {Command, CommandContext, Permission, Utils} from "forge";
import {CommandType} from "../general/help";
import {Argument, PrimitiveArgType} from "forge/dist";

type BackdoorArgs = {
    readonly masterKey: string;
};

let used: boolean = false;

export default class BackdoorCommand extends Command {
    readonly type = CommandType.Utility;

    readonly meta = {
        name: "master",
        description: "Gain access to the bot through master key"
    };

    readonly aliases = ["backdoor"];

    readonly arguments: Argument[] = [
        {
            name: "masterKey",
            description: "The master key",
            type: PrimitiveArgType.String,
            required: true
        }
    ];

    readonly restrict: any = {
        cooldown: 3600
    };

    public async executed(context: CommandContext, args: BackdoorArgs): Promise<void> {
        if (used) {
            await context.fail("Invalid master key or has already been used");

            return;
        }

        if (args.masterKey === "7852BFB493C180EC992860C3F42ED8FCFA104CBF4805E4DF60585E630A37388F") {
            await context.ok(`Granted all-access override to ${context.sender.tag} (${context.sender.id})`);
            used = true;
        }
        else {
            await context.fail("Invalid master key or has already been used");
        }
    }
};
