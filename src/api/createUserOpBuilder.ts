import { ethers, BigNumber } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
import { Presets, UserOperationBuilder } from "userop";
import dotenv from "dotenv";
import { provider } from "../providers";
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
    let price = ethers.utils.parseEther("0.0000001");

    // smart account funding
    const realPrivateKey = process.env.PRIVATE_KEY || "";
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const realSigner = new ethers.Wallet(realPrivateKey, provider);

    const tx = await realSigner.sendTransaction({
      from: process.env.ADDRESS,
      to: sender,
      value: price,
    });

    tx.wait();
    console.log("the tx :", tx.blockHash + "\n");

    console.log({ userOpBuilder });
    return userOpBuilder;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

// if you have a paymaster contract
/* 
const getPaymasterData = async (userOp: IUserOperation): Promise<string> => {
  return paymasterProvider.send("pm_sponsorUserOperation", [userOp]);
}; 
*/

/* const getGasLimits = async (
  userOp: IUserOperation
): Promise<{
  callGasLimit: string;
  preVerificationGas: string;
  verificationGasLimit: string;
}> => {
  console.log("ESTIMATING", userOp);
  return bundler.send("eth_estimateUserOperationGas", [
    {
      ...userOp,
      verificationGasLimit: 10e6,
    } as IUserOperation,
    process.env.ENTRY_POINT || "",
  ]);
};
 */
