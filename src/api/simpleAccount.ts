import { Client, ICall, Presets } from "userop";
import { ethers, Wallet } from "ethers";
import dotenv from "dotenv";
dotenv.config();

// bundler instance
const bundlerRPCUrl: string = process.env.BUNDLER_RPC_URL_STACK || "";

export const createSimpleAccount = async (): Promise<{
  signer: Wallet;
  simpleAccount: Presets.Builder.SimpleAccount;
}> => {
  // signer creation
  const privateKey = ethers.Wallet.createRandom().privateKey;
  console.log("private key", privateKey);
  const signer = new ethers.Wallet(privateKey);

  console.log("Bundler API :", bundlerRPCUrl);

  // get paymaster
  const opts = await getPaymaster();

  // Create a new Smart Account builder
  const simpleAccount = await Presets.Builder.SimpleAccount.init(
    signer,
    bundlerRPCUrl,
    opts
  );

  const smartAccountAddress = simpleAccount.getSender();
  console.log("smart wallet address", smartAccountAddress);

  return { signer, simpleAccount };
};

// send userOp
export const sendUserOp = async (
  signer: Wallet,
  simpleAccount: Presets.Builder.SimpleAccount
): Promise<void> => {
  // Initialize from the same userop builder
  const address = simpleAccount.getSender();
  console.log(`Account address: ${address}`);

  // Build call
  let receiver: string = process.env.ADDRESS || "";
  let price = ethers.utils.parseEther("0.001");

  const call = {
    to: receiver,
    value: price,
    data: "0x",
  };

  // Build & send
  const client = await Client.init(bundlerRPCUrl);
  const res = await client.sendUserOperation(
    simpleAccount.execute(call.to, call.value, call.data),
    {
      onBuild: (op) => console.log("Signed UserOperation:", op),
    }
  );

  console.log(`UserOpHash: ${res.userOpHash}`);
  console.log("Waiting for transaction...");
  const ev = await res.wait();
  console.log(`Transaction hash: ${ev?.transactionHash ?? null}`);
};

const getPaymaster = async () => {
  const paymasterContext = { type: "payg" };
  const paymasterUrl: string = process.env.PAYMASTER_URL_STACK || "";

  const paymasterMiddleware = await Presets.Middleware.verifyingPaymaster(
    paymasterUrl,
    paymasterContext
  );

  const opts =
    paymasterUrl.toString() === ""
      ? {}
      : {
          paymasterMiddleware: paymasterMiddleware,
        };

  return opts;
};
