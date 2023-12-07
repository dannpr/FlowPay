import { BigNumber } from "ethers";
// import { defaultAbiCoder } from "ethers/lib/utils";
import { Presets, UserOperationBuilder } from "userop";
import dotenv from "dotenv";
import { provider } from "../providers";
dotenv.config();

//  Send the userOp to the bundler
export async function getUserOperationBuilder(
  sender: string,
  nonce: BigNumber,
  //initCode: Uint8Array,
  encodedCallData: string
  /*   signature: string
   */
) {
  try {
    // Encode our signatures into a bytes
    // const encodedSignature = defaultAbiCoder.encode(["bytes"], [signature]);

    // set the paymaster
    /*     const paymasterContext = { type: "payg" };
    const paymasterUrl: string = process.env.PAYMASTER_URL_STACK || "";
 */
    // Use the UserOperationBuilder class to create a new builder
    // Supply the builder with all the necessary details to create a userOp
    const userOpBuilder = new UserOperationBuilder()
      .setSender(sender)
      .setNonce(nonce)
      .setCallData(encodedCallData);

    // not needed for now
    // .setSignature(encodedSignature)
    //.setInitCode(initCode) not needed already deployed
    /*  .useMiddleware(Presets.Middleware.getGasPrice(provider))
      .useMiddleware(
        Presets.Middleware.verifyingPaymaster(paymasterUrl, paymasterContext)
      );

    // sign userOp
    // add the signature in the userOp builder

    // get the user op hash then sign

    // create client

    // send it to the bundler

    // if the paymaster is a conttract
    // Estimate the userOp's gas cost related to the network id
    const { chainId } = await provider.getNetwork();
    // estimate the userOp's gas cost without paymaster
    const UserOp = await userOpBuilder.buildOp(
      process.env.ENTRYPOINT || "",
      chainId
    );

    console.log({ UserOp }); */

    // provider will have the same interface as a regular JsonRpcProvider.
    /*     const paymasterProvider = new BundlerJsonRpcProvider(rpcUrl).setBundlerRpc(
      config.overrideBundlerRpc
    ) */
    //paymasterProvider.send("pm_sponsorUserOperation", [userOp]);

    /*     const userOpWithPaymaster =
      userOpBuilder.useMiddleware(paymasterMiddleware);

    console.log({ userOpWithPaymaster }); */

    /*
    // estimate the userOp's gas cost with paymaster
    // don't use it yet to do complicated stuff
    const paymasterAndData = await getPaymasterData(
      userOpToEstimateNoPaymaster
    );

    // we direclty set the paymaster don't know how to do it
    userOpBuilder.setPaymasterAndData(paymasterAndData);
 
    // Don't do complicated stuff yet
    const userOpToEstimate = {
      ...userOpToEstimateNoPaymaster,
      paymasterAndData,
    };

    console.log("Estimated userOp : ", { userOpToEstimate });

    // get the real gas limit with paymaster
    //build the real userOp with paymaster
    const [realGasLimit, baseUserOp] = await Promise.all([
      getGasLimits(userOpToEstimate),
      userOpBuilder.buildOp(process.env.ENTRY_POINT || "", chainId),
    ]);

    // final userOp with all parameters
    const userOp: IUserOperation = {
      ...baseUserOp,
      callGasLimit: realGasLimit.callGasLimit,
      preVerificationGas: realGasLimit.preVerificationGas,
      verificationGasLimit: realGasLimit.verificationGasLimit,
      paymasterAndData,
    };
 */
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
