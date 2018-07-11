import {CommandOptions} from "discord-anvil/dist";
import CommandContext from "discord-anvil/dist/commands/command-context";

export default <CommandOptions>{
    meta: {
        name: "test",
        desc: "Test stuff"
    },

    restrict: {
        specific: [
            "@285578743324606482"
        ],

        cooldown: 5
    },

    executed: async (context: CommandContext, api: any): Promise<void> => {
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
