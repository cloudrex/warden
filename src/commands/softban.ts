import {GuildMember} from "discord.js";
import { Command, Permission, CommandContext } from "discord-anvil";
import SpecificGroups from "../specific-groups";

export default class Softban extends Command {
    readonly meta = {
        name: "softban",
        description: "Softban a user"
    };

    readonly args = {
        user: "!:member",
        reason: "!string"
    };

    constructor() {
        super();

        this.restrict.specific = SpecificGroups.owner;
        this.restrict.selfPermissions = [Permission.BanMembers];
    }

    public executed(context: CommandContext, api: any): Promise<void> {
        return new Promise(async (resolve) => {
            const member: GuildMember = context.arguments[0];

            if (member.id === context.sender.id) {
                context.fail("You can't ban yourself.");

                return;
            }
            else if (!member.bannable) {
                context.fail("Unable to ban that person.");

                return;
            }

            member.ban({
                days: 1,
                reason: context.arguments[1]
            }).then(async () => {
                // TODO: Does it actually await this?
                await api.reportCase({
                    moderator: context.sender,
                    color: "RED",
                    reason: context.arguments[1],
                    evidence: context.arguments.length === 3 ? context.arguments[2] : undefined,
                    title: "Ban",
                    member: member
                });

                resolve();
            }).catch(async (error: Error) => {
                // TODO: Does it actually await this?
                await context.fail(`Operation failed. (${error.message})`);
            });

            await context.message.guild.unban(member.id, "Softban");
            resolve();
        });
    }
};
