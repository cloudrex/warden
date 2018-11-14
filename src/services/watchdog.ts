import {IFragmentMeta} from "@cloudrex/forge";
import {ForkedService, IProcessMsg, ProcessMsgType} from "@cloudrex/forge";
import {Log} from "@cloudrex/forge";

export default class WatchdogService extends ForkedService {
    readonly meta: IFragmentMeta = {
        name: "watchdog",
        description: "Warden's status supervision service"
    };

    readonly fork: boolean = true;

    public start(): void {
        //
        Log.debug("Watchdog service started!");
    }

    public onMessage(msg: IProcessMsg, sender: any): void {
        Log.debug("Got a message @ watchdog service!");
    }
}