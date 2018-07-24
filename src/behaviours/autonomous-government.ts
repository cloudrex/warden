import { Behaviour, Bot } from "discord-anvil";

export default class AutonomousGovernment extends Behaviour {
    readonly meta = {
        name: "Autonomous Government",
        description: "Handle the autonomous government system of the server"
    };

    public enabled(bot: Bot): void {
        
    }
}