import {Command, IFragmentMeta, CommandContext, IArgument, InternalArgType, ChatEnvironment} from "@cloudrex/forge";
import {Snowflake, Message} from "discord.js";

type IPortalArgs = {
    readonly messageId: Snowflake;
}

export default class PortalCommand extends Command {
    readonly meta: IFragmentMeta = {
        name: "portal",
        description: "Generate a message-link portal"
    };

    readonly arguments: IArgument[] = [
        {
            name: "messageId",
            description: "The ID of the target message",
            required: true,
            type: InternalArgType.Snowflake,
            switchShortName: "i"
        }
    ];

    readonly restrict: any = {
        environment: ChatEnvironment.Guild
    };

    // TODO: Erroring every odd execution for some reason
    public async executed(x: CommandContext, args: IPortalArgs): Promise<void> {
        let error: boolean = false;

        await x.c.fetchMessage(args.messageId).catch(() => {
            error = true;
        }).then(async () => {
            if (!error) {
                await x.c.send(`https://discordapp.com/channels/${x.g.id}/${x.c.id}/${args.messageId}`);
            }
            else {
                await x.fail("Could not find such message in this channel");
            }
        });
    }
}