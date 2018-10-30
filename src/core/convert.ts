import {IModAction, IDbModAction} from "../database/mongo-database";
import {Snowflake} from "discord.js";

export default abstract class Convert {
    public static toDatabaseModerationAction(caseId: Snowflake | null, action: IModAction, automatic: boolean): IDbModAction {
        return {
            id: caseId as Snowflake,
            type: action.type,
            reason: action.reason,
            memberId: action.member.id,
            memberTag: action.member.user.tag,
            moderatorAvatarUrl: action.moderator.user.avatarURL,
            moderatorTag: action.moderator.user.tag,
            moderatorUsername: action.moderator.user.username,
            guildId: action.member.guild.id,
            moderatorId: action.moderator.id,
            
            // TODO: What if it's an IDbTimedModAction?
            //end: action.end,
            
            time: Date.now(),
            evidence: action.evidence,
            automatic
        };
    }
}