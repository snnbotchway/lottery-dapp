require("dotenv").config();

const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const {abi, bytecode} = require("./compile");

const mnemonicPhrase = process.env.MNEMONIC_PHRASE;
const provider = new HDWalletProvider({
    mnemonic: {
        phrase: mnemonicPhrase,
    },
    providerOrUrl: process.env.PROVIDER_URL,
});

const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log("Attempting to deploy from account", accounts[0]);

    contract = await new web3.eth.Contract(abi)
        .deploy({data: bytecode})
        .send({from: accounts[0], gas: 1000000});

    console.log("Contract deployed to", contract.options.address);
};
deploy();

provider.engine.stop();
