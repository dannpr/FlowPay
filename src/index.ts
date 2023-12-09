import { CreatePayflowAccount } from "./api/InAccount";
/* import { createSimpleAccount, sendUserOp } from "./api/simpleAccount_stack";
 */
import { ethers } from "ethers";

async function main() {
  /* const { signer, simpleAccount } = await createSimpleAccount();

  const account = await simpleAccount.getSender();
  let price = ethers.utils.parseEther("0.0000001");

  // smart account funding
  const realPrivateKey = process.env.PRIVATE_KEY || "";
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const realSigner = new ethers.Wallet(realPrivateKey, provider);

  const tx = await realSigner.sendTransaction({
    from: process.env.ADDRESS,
    to: account,
    value: price,
  });

  await sendUserOp(simpleAccount); */

  const to = process.env.ADDRESS || "";

  const value = ethers.constants.Zero;
  //const value = ethers.utils.parseEther("0.0000001");

  CreatePayflowAccount(to, value);
}

main();
