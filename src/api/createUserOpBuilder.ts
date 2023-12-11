import { ethers, BigNumber } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
import { Presets, UserOperationBuilder } from "userop";
import dotenv from "dotenv";
import { provider } from "../constants/providers";
dotenv.config();

//  Send the userOp to the bundler
export async function getUserOperationBuilder(
  sender: string,
  nonce: BigNumber,
  initCode: Uint8Array,
  encodedCallData: string
) {
  try {
    //Encode our signatures into a bytes
    //const encodedSignature = defaultAbiCoder.encode(["bytes"], [signature]);

    //console.log("the signature :", encodedSignature + "\n");
    console.log(sender, "\n");

    // Use the UserOperationBuilder class to create a new builder
    // Supply the builder with all the necessary details to create a userOp
    const userOpBuilder = new UserOperationBuilder()
      .useDefaults({
        preVerificationGas: 100_000,
        callGasLimit: 100_000,
        verificationGasLimit: 2_000_000,
      })
      .setSender(sender)
      .setInitCode(initCode)
      .setNonce(nonce)
      .setCallData(encodedCallData);

    // quick transfer
    const tx = await testTransfer(sender);

    // create a waiting moment for the bundler to be ready
    await new Promise((resolve) => setTimeout(resolve, 10000));
    console.log(`The transaction block hash is: ${tx.hash} \n`);

    console.log({ userOpBuilder });

    return userOpBuilder;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

const testTransfer = async (sender: string) => {
  // quick transfer
  //const value = ethers.utils.parseEther("0.0000001");
  const value = ethers.constants.Zero;

  // smart account funding
  const realPrivateKey = process.env.PRIVATE_KEY || "";
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const realSigner = new ethers.Wallet(realPrivateKey, provider);

  const tx = await realSigner.sendTransaction({
    from: process.env.ADDRESS,
    to: sender,
    value: value,
  });

  tx.wait();
  console.log("Waiting for transaction...");
  // create a waiting moment for the bundler to be ready
  return tx;
};
