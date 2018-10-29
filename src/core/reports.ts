import {Snowflake} from "discord.js";
import Mongo from "../database/mongo-database";

export default class Reports {
    public static async getExpiredReports<ReportType = ITimedReport>(): Promise<ReportType[]> {
        return await Mongo.collections.reports.aggregate([
            {
                $project: {
                    start: 1,
                    last: 1,
                    next: 1,
                    iterations: 1,
                    maxIterations: 1,
                    recipients: 1,
                    fields: 1,
                    _id: 0,

                    expired: {
                        $gte: ["$iterations", "$maxIterations"]
                    }
                }
            }
        ]).toArray();
    }
}

export type IReportField = {
    readonly name: string;
    readonly message: string;
}

export type IReport = {
    readonly recipients: Snowflake[];
    readonly fields: any;
}

export interface ITimedReport extends IReport {
    readonly start: number;
    readonly last: number;
    readonly next: number;
    readonly iterations: number;
    readonly maxIterations: number;
}