import { createSimpleAccount, sendUserOp } from "./api/simpleAccount";
import { ethers } from "ethers";

async function main() {
  const { signer, simpleAccount } = await createSimpleAccount();

  const account = await simpleAccount.getSender();
  let price = ethers.utils.parseEther("0.001");

  // smart account funding
  /* const realPrivateKey = process.env.PRIVATE_KEY || "";
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const realSigner = new ethers.Wallet(realPrivateKey, provider);

  await realSigner.sendTransaction({
    from: process.env.ADDRESS,
    to: account,
    value: price,
  }); */

  await sendUserOp(signer, simpleAccount);
}

main();
