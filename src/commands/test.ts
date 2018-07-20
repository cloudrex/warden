import { Command, CommandContext } from "discord-anvil";

export default abstract class Test extends Command {
    readonly meta = {
        name: "test",
        description: "Test stuff"
    };

    readonly restrict = {
        specific: [
            "@285578743324606482"
        ],

        cooldown: 5
    };

    public async executed (context: CommandContext, api: any): Promise<void> {
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
