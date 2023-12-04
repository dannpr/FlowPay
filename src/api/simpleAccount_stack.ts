import { Client, BundlerJsonRpcProvider, Presets } from "userop";
import { ethers, Wallet } from "ethers";
import dotenv from "dotenv";
dotenv.config();

// bundler instance
const bundlerRPCUrl: string = process.env.BUNDLER_RPC_URL_STACK || "";

export async function createSimpleAccount(): Promise<{
  signer: Wallet;
  simpleAccount: Presets.Builder.SimpleAccount;
}> {
  // signer creation
  const privateKey = ethers.Wallet.createRandom().privateKey;

  console.log("1) Key us generated : private key => ", privateKey, "\n");
  const signer = new ethers.Wallet(privateKey);

  console.log("Bundler API :", bundlerRPCUrl);

  // get paymaster
  const opts = await optsPM();

  // Create a new Smart Account builder
  const simpleAccount = await Presets.Builder.SimpleAccount.init(
    signer,
    bundlerRPCUrl,
    opts
  );

  const smartAccountAddress = simpleAccount.getSender();
  console.log("2) smart wallet address", smartAccountAddress, "\n");

  return { signer, simpleAccount };
}

// send userOp
export const sendUserOp = async (
  simpleAccount: Presets.Builder.SimpleAccount
): Promise<void> => {
  // get paymaster
  const opts = await optsPM();

  // Initialize from the same userop builder
  const address = simpleAccount.getSender();
  console.log(`Account address: ${address}`);

  // Build call
  console.log("3) create the builder call \n");

  let capturedCallData = null;
  const provider = new BundlerJsonRpcProvider(
    process.env.BUNDLER_RPC_URL_STACK
  ).setBundlerRpc(opts.overrideBundlerRpc);

  let receiver: string = process.env.ADDRESS || "";
  let price = ethers.utils.parseEther("0.0000001");

  const call = {
    to: receiver,
    value: price /* ethers.constants.Zero */,
    data: "0x",
  };

  console.log(`4) call formed`, call, "\n");

  // Build & send
  const client = await Client.init(bundlerRPCUrl);
  console.log(`5) init client`);

  // create a waiting moment for the bundler to be ready
  await new Promise((resolve) => setTimeout(resolve, 10000));

  const res = await client.sendUserOperation(
    simpleAccount.execute(call.to, call.value, call.data),
    {
      /*    dryRun: opts.dryRun, */
      onBuild: (op) => {
        capturedCallData = op;
        console.log("op", op, "\n");
      },
    }
  );

  /*
  let entrypoint = process.env.ENTRYPOINT;

    const gasEstimate = await provider.send(`eth_estimateUserOperationGas`, [
    capturedCallData,
    entrypoint,
  ]);
  console.log(`GAS ESTIMATE `, gasEstimate); 
  */

  console.log(`UserOpHash: ${res.userOpHash}`);
  console.log("Waiting for transaction...");
  const ev = await res.wait();
  console.log(`Transaction hash: ${ev?.transactionHash ?? null}`);
};

const optsPM = async () => {
  const paymasterContext = { type: "payg" };
  const paymasterUrl: string = process.env.PAYMASTER_URL_STACK || "";

  const paymasterMiddleware = Presets.Middleware.verifyingPaymaster(
    paymasterUrl,
    paymasterContext
  );

  const opts =
    paymasterUrl.toString() === ""
      ? {}
      : {
          paymasterMiddleware: paymasterMiddleware,
          overrideBundlerRpc: process.env.BUNDLER_RPC_URL_STACK,
          dryRun: true,
        };

  return opts;
};
