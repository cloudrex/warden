import {Command, CommandContext, Permission, Utils} from "forge";
import {CommandType} from "../general/help";
import {GuildMember} from "discord.js";
import Mongo, {DatabaseMessage} from "../../database/mongo-database";
import {Argument} from "forge/dist";

type LastSeenArgs = {
    readonly member: GuildMember;
};

export default class LastSeenCommand extends Command {
    readonly type = CommandType.Informational;

    readonly meta = {
        name: "lastseen",
        description: "Display the last time a user was seen"
    };

    readonly aliases = ["ls"];

    readonly arguments: Argument[] = [
        {
            name: "member",
            type: "member",
            required: true
        }
    ];

    public async executed(context: CommandContext, args: LastSeenArgs): Promise<void> {
        if (args.member.id === context.bot.client.user.id) {
            await context.ok("I was last seen **just now**");

            return;
        }

        const result: DatabaseMessage | undefined = (await Mongo.collections.messages.find({
            authorId: args.member.id
        }).sort({
            _id: -1
        }).limit(1).toArray())[0];

        if (result !== undefined) {
            await context.ok(`<:binoculars:490726532784979980> <@${args.member.id}> was last seen **${Utils.timeAgo(result.time, false)}**`);
        }
        else {
            await context.fail(`No recorded data for <@${args.member.id}>`);
        }
    }
};
