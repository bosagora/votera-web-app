import { Amount, BOACoin, Client, Context, ProposalType } from "votera-sdk-client";
import { Deployments } from "../helper/Deployments";
import { AddressStorage, IssuedContract } from "votera-contracts-lib";

async function main() {
    const deployments = new Deployments();
    await deployments.attachAll();

    const ctx = new Context({ ...deployments.getContextParams(), signer: deployments.accounts.voters[0] });
    const client = new Client(ctx);

    const address = deployments.accounts.voters[0].address;
    console.log(`address of voters: ${address}`);
    console.log(`address of client: ${await client.web3.getSigner()?.getAddress()}`);

    const length = await client.methods.getProposalLength();
    console.log(`length of proposals: ${length}`);

    console.log(`is participant: ${await client.methods.isParticipant(address)}`);
    const provider = client.web3.getProvider();
    if (provider !== undefined) {
        const balance = await provider.getBalance(address);
        console.log(`balance of participant: ${new BOACoin(balance).toDisplayString(true, 2)}`);
    }

    const fundAmount = Amount.make(150000000, 18).value;
    const fee1 = await client.estimation.getProposalFee(ProposalType.FUND, fundAmount);
    console.log(`proposal fee of fund proposal: ${new BOACoin(fee1).toDisplayString(true, 6)}`);
    const fee2 = await client.estimation.getProposalFee(ProposalType.SYSTEM, fundAmount);
    console.log(`proposal fee of system proposal: ${new BOACoin(fee2).toDisplayString(true, 6)}`);

    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage && provider) {
        console.log(`AddressStorage in AddressStorage : ${addressStorage.address}`);
        const IssuedContractAddress = await addressStorage.connect(provider).getAddress("IssuedContract");
        console.log(`IssuedContract in AddressStorage : ${IssuedContractAddress}`);
        const BudgetManagerAddress = await addressStorage.connect(provider).getAddress("BudgetManager");
        console.log(`BudgetManager in AddressStorage : ${BudgetManagerAddress}`);

        const contract = deployments.getContract("IssuedContract") as IssuedContract;
        console.log(`BudgetManager in IssuedContract: ${await contract.connect(provider).getCommonsBudgetAddress()}`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
