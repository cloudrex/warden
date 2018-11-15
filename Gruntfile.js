const os = require("os");
const {exec} = require("child_process");

module.exports = (grunt) => {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json")
    });

    // Default task(s).
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
            console.log(`Platform '${platform}' is not supported for this task`);
        }
    });
};
