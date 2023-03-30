import path from "path";
import fs from "fs";
import solc from "solc";
import {Contract, SolcInput, SolcOutput} from "./interfaces/solc";

const lotteryPath: string = path.resolve(__dirname, "contracts", "Lottery.sol");
const source: string = fs.readFileSync(lotteryPath, "utf8");

const input: SolcInput = {
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

const output: SolcOutput = JSON.parse(solc.compile(JSON.stringify(input)));

const contractName: string = "Lottery";
const contract: Contract = output.contracts["Lottery.sol"][contractName];

if (!contract) {
    throw new Error(`Contract ${contractName} not found in compiled output`);
}

const {
    abi,
    evm: {
        bytecode: {object: bytecode},
    },
}: Contract = contract;

export {abi, bytecode};
