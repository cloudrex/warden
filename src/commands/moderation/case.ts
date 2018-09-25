import {Command, CommandContext} from "discord-anvil";
import {CommandType} from "../general/help";
import {Argument} from "discord-anvil/dist";
import {RestrictGroup} from "discord-anvil/dist/commands/command";
import Mongo from "../../database/mongo-database";
import {GuildMember} from "discord.js";
import ChatEnvironment from "discord-anvil/dist/core/chat-environment";

type ClearWarnsArgs = {
    readonly member: GuildMember;
};

export default class CaseCommand extends Command {
    readonly type = CommandType.Moderation;

    readonly meta = {
        name: "clearwarns",
        description: "Clear all warnings from an user"
    };

    readonly arguments: Array<Argument> = [
        {
            name: "member",
            description: "The target user",
            type: "member",
            required: true
        }
    ];

    readonly restrict: any = {
        specific: [RestrictGroup.ServerModerator],
        environment: ChatEnvironment.Guild
    };

    public async executed(context: CommandContext, args: ClearWarnsArgs): Promise<void> {
        // TODO
        await context.fail("Not yet implemented");
    }
};
