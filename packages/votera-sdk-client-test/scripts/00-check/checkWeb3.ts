import { Client, Context } from "votera-sdk-client";
import { Deployments } from "../helper/Deployments";
import { AddressStorage, IssuedContract, IssuedContract__factory } from "votera-contracts-lib";

async function main() {
    const deployments = new Deployments();
    await deployments.attachAll();

    const ctx = new Context({ ...deployments.getContextParams(), signer: deployments.accounts.voters[0] });
    const client = new Client(ctx);

    const isUp = await client.methods.web3.isUp();
    console.log(`web3.isUp : ${isUp}`);

    console.log(`Address of contracts`);

    const provider = client.web3.getProvider();
    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage && provider) {
        console.log(`AddressStorage : ${addressStorage.address}`);
        const IssuedContractAddress = await addressStorage.connect(provider).getAddress("IssuedContract");
        console.log(`IssuedContract : ${IssuedContractAddress}`);
        const BudgetManagerAddress = await addressStorage.connect(provider).getAddress("BudgetManager");
        console.log(`BudgetManager : ${BudgetManagerAddress}`);

        const contract = deployments.getContract("IssuedContract") as IssuedContract;
        console.log(`BudgetManager in IssuedContract: ${await contract.connect(provider).getCommonsBudgetAddress()}`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
