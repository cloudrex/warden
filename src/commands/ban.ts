import {GuildMember} from "discord.js";
import {WardenAPI} from "../warden-api";
import {Command, Permission, CommandContext} from "discord-anvil";

export default class Ban extends Command {
    readonly meta = {
        name: "ban",
        description: "Ban a member"
    };

    readonly args = {
        user: "!:member",
        reason: "!string",
        evidence: "string"
    };

    constructor() {
        super();

        this.restrict.issuerPermissions = [Permission.BanMembers];
        this.restrict.selfPermissions = [Permission.BanMembers];
    }

    public executed(context: CommandContext, api: WardenAPI): Promise<void> {
        return new Promise((resolve) => {
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
        });
    }
};
