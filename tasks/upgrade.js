const exec = require("child_process").exec;
const fs = require("fs");
const path = require("path");

const aPath = process.env.a_path || "../anvil/package.json";
const pkgC = JSON.parse(fs.readFileSync(aPath).toString());
const lver = parseInt(pkgC.version.split(".")[2]);

if (lver + 1 > 9) {
    pkgC.version = upmver(pkgC.version);
}
else {
    const s = pkgC.version.split(".");

    pkgC.version = `${s[0]}.${s[1]}.${lver + 1}`;
}

fs.writeFileSync(aPath, JSON.stringify(pkgC));

const pub = [
    `cd ${path.dirname(aPath)}`,
    "npm publish",
    `cd /d ${__dirname}`,
    'npm update discord-anvil',
    'npm start'
];

exec(pub.join(" && "), (error, stdout) => {
    if (error) {
         console.log("There was an error ", error);
         process.exit(0);
    }

    console.log(stdout.toString());
});

function upmver(ver) {
    const s = ver.split(".");

    return `${s[0]}.${parseInt(s[1]) + 1}.0`;
}