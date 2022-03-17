const fs = require("fs");
const { exit, argv } = require("process");

if (argv.length < 3 && typeof argv[2] !== "string") {
    console.log("Provice a file");

    exit(-1);
}

if (!fs.existsSync(argv[2])) {
    console.log("file not found");

    exit(-2);
}

const input = require(argv[2]);

if (typeof input !== "object") {
    console.log("Error reading json");

    exit(-3);
}

const warnings = {};

const dangerousPackages = [
    "node-ipc",
    "js-queue",
    "node-cmd",
    "easy-stack",
    "js-message",
    "peacenotwar",
    "event-pubsub"
];

let checkedDependencies = 0;

const checkFor = (packages, package, path) => {
    const key = path.join("/");

    if (packages.includes(package)) {
        if (!Array.isArray(warnings[key])) {
            warnings[key] = [];
        }

        warnings[key].push(package);
    }
};

const checkDependencies = (package, path) => {
    checkedDependencies++;

    if (typeof package.dependencies !== "object") {
        return;
    }

    const packages = Object.keys(package.dependencies);

    dangerousPackages.forEach((package) => {
        checkFor(packages, package, path);
    });

    const childPath = [...path, package.name];

    Object.values(package.dependencies).forEach((dependency) => {
        checkDependencies(dependency, childPath);
    });
};

checkDependencies(input, []);

console.log(`Found ${Object.keys(warnings).length} warnings in ${checkedDependencies} dependencies`);
console.log("Warnings:")
console.log(warnings);
