import {Command, CommandContext} from "discord-anvil";
import SpecificGroups from "../specific-groups";

export default class Test extends Command {
    readonly meta = {
        name: "test",
        description: "Test stuff"
    };

    constructor() {
        super();

        this.restrict.specific = SpecificGroups.owner;
    }

    public async executed(context: CommandContext, api: any): Promise<void> {
        /* const setup = SetupHelper.fromContext(context, "Setup Test");

        if (setup) {
            const responses = await setup
                .input("What is your favorite color?")
                .input("What is the name of your pet?")
                .question("Do you like doggos?")
                .finish();

            console.log(responses);
        } */
        context.ok("test");
    }
};
