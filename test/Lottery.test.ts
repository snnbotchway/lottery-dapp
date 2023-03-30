import assert from "assert";
import Contract from "web3-eth-contract";
import {abi, bytecode} from "../compile";
import {enterLottery, getBalance, toWei, web3} from "./utils";

let accounts: string[];
let lottery: Contract;

beforeEach(async (): Promise<void> => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();

    // Use one of those accounts to deploy the contract
    lottery = await new web3.eth.Contract(abi)
        .deploy({data: bytecode})
        .send({from: accounts[0], gas: 1_000_000});
});

describe("Lottery Contract", (): void => {
    it("Deploys successfully", (): void => {
        assert(lottery.options.address);
    });

    it("Assigns contract creator as manager", async (): Promise<void> => {
        assert.strictEqual(await lottery.methods.manager().call(), accounts[0]);
    });

    it("Allows accounts to enter", async (): Promise<void> => {
        for (let i = 0; i < 3; i++) {
            await enterLottery(accounts[i], lottery);

            const players: string[] = await lottery.methods.getPlayers().call();
            assert.strictEqual(players[i], accounts[i]);
            assert.strictEqual(players.length, i + 1);
        }
    });

    it("Requires a minimum amount of ether to enter", async (): Promise<void> => {
        let transactionSucceeded: boolean = false;
        try {
            await enterLottery(accounts[0], lottery, 0.01);

            transactionSucceeded = true;
        } catch (err) {
            assert(err);
        }

        assert(!transactionSucceeded);
    });

    it("Requires only the manager can pick a winner", async (): Promise<void> => {
        // Add a player
        await enterLottery(accounts[0], lottery);

        let transactionSucceeded: boolean = false;
        try {
            await lottery.methods.pickWinner().send({from: accounts[1], gas: 1_000_000});

            transactionSucceeded = true;
        } catch (err) {
            assert(err);
        }

        assert(!transactionSucceeded);
    });

    it("Sends winner contract balance and resets the players arrays", async (): Promise<void> => {
        // Add a player
        const stake: number = 2;
        await enterLottery(accounts[0], lottery, stake);

        const initialBalance: number = await getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({from: accounts[0], gas: 1_000_000});

        // Assert account was paid slightly less than the stake
        const finalBalance: number = await getBalance(accounts[0]);
        const amountPaid: number = finalBalance - initialBalance;
        const slightlyLessThanStake: number = stake - 0.0001;
        assert(amountPaid > toWei(slightlyLessThanStake) && amountPaid < toWei(stake));

        const players: string[] = await lottery.methods.getPlayers().call();
        assert(!players.length);
    });
});
