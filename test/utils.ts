import ganache from "ganache";
import Web3 from "web3";
import {provider} from "web3-core";
import Contract from "web3-eth-contract";

export const web3: Web3 = new Web3(ganache.provider() as provider);

export async function getBalance(account: string): Promise<number> {
    return parseInt(await web3.eth.getBalance(account));
}

export function toWei(etherAmount: number): number {
    return parseInt(web3.utils.toWei(etherAmount.toString(), "ether"));
}

export async function enterLottery(
    account: string,
    contract: Contract,
    amount: number = 0.011
): Promise<void> {
    await contract.methods
        .enter()
        .send({from: account, gas: 1_000_000, value: toWei(amount)});
}
