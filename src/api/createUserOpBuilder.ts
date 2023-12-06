import { BigNumber } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
import { UserOperationBuilder, IUserOperation } from "userop";
import { entrypointContract } from "./../contract";
import { provider, paymasterProvider, bundler } from "./../providers";

export async function getUserOperationBuilder(
  sender: string,
  nonce: BigNumber,
  initCode: Uint8Array,
  encodedCallData: string,
  signature: string
) {
  try {
    // Encode our signatures into a bytes
    const encodedSignatures = defaultAbiCoder.encode(["bytes"], [signature]);

    // Use the UserOperationBuilder class to create a new builder
    // Supply the builder with all the necessary details to create a userOp
    const userOpBuilder = new UserOperationBuilder()
      .useDefaults({
        preVerificationGas: 100_000,
        callGasLimit: 100_000,
        verificationGasLimit: 2_000_000,
      })
      .setSender(sender)
      .setNonce(nonce)
      .setCallData(encodedCallData)
      .setSignature(encodedSignatures)
      .setInitCode(initCode);

    // Estimate the userOp's gas cost
    // get the network id
    const { chainId } = await provider.getNetwork();
    // estimate the userOp's gas cost without paymaster
    const userOpToEstimateNoPaymaster = await userOpBuilder.buildOp(
      process.env.ENTRY_POINT || "",
      chainId
    );
    // estimate the userOp's gas cost with paymaster
    const paymasterAndData = await getPaymasterData(
      userOpToEstimateNoPaymaster
    );

    const userOpToEstimate = {
      ...userOpToEstimateNoPaymaster,
      paymasterAndData,
    };

    console.log("Estimated userOp : ",{ userOpToEstimate });

    return userOpBuilder;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

const getPaymasterData = async (userOp: IUserOperation): Promise<string> => {
  return paymasterProvider.send("pm_sponsorUserOperation", [userOp]);
};
