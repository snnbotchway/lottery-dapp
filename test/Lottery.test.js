const assert = require("assert");
const ganache = require("ganache");
const Web3 = require("web3");
const {abi, bytecode} = require("../compile");

const web3 = new Web3(ganache.provider());

function toWei(etherAmount) {
    return web3.utils.toWei(etherAmount.toString(), "ether");
}

let accounts;
let lottery;

async function enterLottery(account, amount = 0.011) {
    await lottery.methods
        .enter()
        .send({from: account, gas: 1000000, value: toWei(amount.toString())});
}

beforeEach(async () => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();

    // Use one of those accounts to deploy the contract
    lottery = await new web3.eth.Contract(abi)
        .deploy({data: bytecode})
        .send({from: accounts[0], gas: 1000000});
});

describe("Lottery Contract", () => {
    it("Deploys successfully", () => {
        assert(lottery.options.address);
    });

    it("Assigns contract creator as manager", async () => {
        assert.equal(await lottery.methods.manager().call(), accounts[0]);
    });

    it("Allows accounts to enter", async () => {
        for (let i = 0; i < 3; i++) {
            await enterLottery(accounts[i]);

            const players = await lottery.methods.getPlayers().call();
            assert.equal(players[i], accounts[i]);
            assert.equal(players.length, i + 1);
        }
    });

    it("Requires a minimum amount of ether to enter", async () => {
        let transactionSucceeded = false;
        try {
            await enterLottery(accounts[0], 0.01);

            transactionSucceeded = true;
        } catch (err) {
            assert(err);
        }

        assert(!transactionSucceeded);
    });

    it("Requires only that only the manager can pick a winner", async () => {
        // Add a player
        await enterLottery(accounts[0]);

        let transactionSucceeded = false;
        try {
            await lottery.methods.pickWinner().send({from: accounts[1], gas: 1000000});

            transactionSucceeded = true;
        } catch (err) {
            assert(err);
        }

        assert(!transactionSucceeded);
    });

    it("Sends money to the winner and resets the players arrays", async () => {
        // Add a player
        const stake = 2;
        await enterLottery(accounts[0], stake);

        const initialBalance = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({from: accounts[0], gas: 1000000});

        // Assert account was paid slightly less than the stake
        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const amountPaid = finalBalance - initialBalance;
        const slightlyLessThanStake = stake - 0.0001;
        assert(amountPaid > toWei(slightlyLessThanStake) && amountPaid < toWei(stake));

        const players = await lottery.methods.getPlayers().call();
        assert(!players.length);
    });
});
