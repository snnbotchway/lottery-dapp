import HDWalletProvider from "@truffle/hdwallet-provider";
import Web3 from "web3";
import Contract from "web3-eth-contract";
import {Mnemonic} from "@truffle/hdwallet-provider/dist/constructor/types";
import {provider as Provider} from "web3-core";
import {abi, bytecode} from "./compile";

require("dotenv").config();

const mnemonicPhrase: string | undefined = process.env.MNEMONIC_PHRASE;
const provider: HDWalletProvider = new HDWalletProvider({
    mnemonic: {
        phrase: mnemonicPhrase,
    } as Mnemonic,
    providerOrUrl: process.env.PROVIDER_URL,
});

const web3: Web3 = new Web3(provider as Provider);

const deploy = async (): Promise<void> => {
    const accounts = await web3.eth.getAccounts();

    console.log("Attempting to deploy from account", accounts[0]);

    const contract: Contract = await new web3.eth.Contract(abi)
        .deploy({data: bytecode})
        .send({from: accounts[0], gas: 1000000});

    console.log("Contract deployed to", contract.options.address);
};
deploy();

provider.engine.stop();
