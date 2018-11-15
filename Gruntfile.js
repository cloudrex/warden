const os = require("os");
const {exec} = require("child_process");

module.exports = (grunt) => {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json")
    });

    // Default task(s).
    grunt.registerTask("default", function () {
        const done = this.async();

        exec("grunt local-forge", (error) => {
            if (error) {
                throw error;
            }

            const platform = os.platform();

            if (platform === "linux") {
                exec("sudo npm start", () => {
                    done();
                });
            }
            else if (platform === "win32") {
                // TODO: CRITICAL: Not showing output
                exec("npm start", () => {
                    done();
                });
            }
            else {
                platformNotSupported(platform);
            }
        });
    });

    grunt.registerTask("local-forge", function () {
        const platform = os.platform();
        const done = this.async();

        if (platform === "win32") {
            console.log("Detected Windows platform; Running task ...");

            exec("npm run local-copy-forge:windows", () => {
                done();
            });
        }
        else if (platform === "linux") {
            console.log("Detected Linux platform; Running task ...");

            exec("npm run local-copy-forge:linux", () => {
                done();
            });
        }
        else {
            platformNotSupported(platform);
        }
    });
};

function platformNotSupported(platform) {
    console.log(`Platform '${platform}' is not supported for this task`);
}