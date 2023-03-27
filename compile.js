const path = require("path");
const fs = require("fs");
const solc = require("solc");

const lotteryPath = path.resolve(__dirname, "contracts", "Lottery.sol");
const source = fs.readFileSync(lotteryPath, "utf8");

const input = {
    language: "Solidity",
    sources: {
        "Lottery.sol": {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            "*": {
                "*": ["*"],
            },
        },
    },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

const contractName = "Lottery";
const contract = output.contracts["Lottery.sol"][contractName];

if (!contract) {
    throw new Error(`Contract ${contractName} not found in compiled output`);
}

const {
    abi,
    evm: {
        bytecode: {object: bytecode},
    },
} = contract;

module.exports = {abi, bytecode};
