import { ethers, BigNumber } from "ethers";
import { concat } from "ethers/lib/utils";
import { randomBytes } from "crypto";
import {
  entrypointContract,
  simpleAccountAbi,
  walletFactoryContract,
} from "../constants/contract";
import { getUserOperationBuilder } from "./createUserOpBuilder";
import { provider } from "../constants/providers";
import { Client, Presets } from "userop";
import dotenv from "dotenv";

dotenv.config();

// wallets manage account
// accounts is the identity of the user
export async function CreatePayflowAccount(
  toAddress: string,
  value: BigNumber
) {
  try {
    // generate base InitCode
    let initCode = Uint8Array.from([]);

    // Generate a random salt, convert it to hexadecimal, and prepend "0x"
    const salt = "0x" + randomBytes(32).toString("hex");

    console.log("0) Salt is generated : ", salt, "\n");

    const [signer, signerAddress] = await createSimpleEOA();

    // Call the getAddress function from the wallet factory contract with the signers and salt
    // This computes the counterfactual address for the wallet without deploying it
    const walletAddress = await walletFactoryContract.getAddress(
      signerAddress,
      salt
    );

    console.log(
      "2) Wallet address is computed not deployed : ",
      walletAddress,
      "\n"
    );

    const accountExist = await inAccountExist(walletAddress);
    // check if account exist
    if (!accountExist) {
      console.log("2.a) Create data and initCode \n");
      // set the data to be sent to the wallet factory contract
      const data = walletFactoryContract.interface.encodeFunctionData(
        "createAccount",
        [signerAddress, salt]
      );

      // Initialize the initCode which will be used to deploy a new wallet
      initCode = concat([walletFactoryContract.address, data]);
    }

    // Get the nonce for the wallet address with a key of 0
    const nonce: BigNumber = await entrypointContract.getNonce(
      walletAddress,
      0
    );

    // Encode the call data  for executing methode
    const encodedCallData = simpleAccountAbi.encodeFunctionData("execute", [
      toAddress,
      value,
      initCode,
    ]);

    // Get the user operation builder with the necessary parameters
    const userOpBuilder = await getUserOperationBuilder(
      walletAddress,
      nonce,
      initCode,
      encodedCallData
    );

    console.log(
      "3) User Opération is built without signature : ",
      userOpBuilder.getOp(),
      "\n"
    );

    const paymasterContext = { type: "payg" };
    const paymasterUrl: string = process.env.PAYMASTER_URL_STACK || "";

    // userOp hashing
    userOpBuilder
      .useMiddleware(Presets.Middleware.getGasPrice(provider))
      .useMiddleware(Presets.Middleware.signUserOpHash(signer as ethers.Wallet))
      .useMiddleware(
        Presets.Middleware.verifyingPaymaster(paymasterUrl, paymasterContext)
      );

    console.log(`4.b)  Gas price and signature are set`);

    await sendUserOpStackup(userOpBuilder);
  } catch (error) {
    console.log(error);
  }
}

// we can add mails instead
/*     
    const salt = utils.id("google:" + email);
    console.log(
      `SimpleAccount Sender computed as: ${computedAddress} using ethers.utils.id("google:" + ${email}) as the salt`
    ); 
*/
const createSimpleEOA = async () => {
  // signer creation
  const privateKey = ethers.Wallet.createRandom().privateKey;

  console.log("1.a) Key us generated : private key => ", privateKey, "\n");

  const signer = new ethers.Wallet(privateKey);
  const signerAddress = signer.address;

  console.log("1.b) Key us generated : address => ", signerAddress, "\n");

  return [signer, signerAddress];
};

const inAccountExist = async (accountAddress: string) => {
  console.log("Test wallet address if exist");
  const inAccountCode = await provider.getCode(accountAddress);

  console.log("yo account wallet Code", inAccountCode, "\n");
  const accountExist = inAccountCode !== "0x";

  if (!accountExist) console.log("Account don't exist need to deploy it \n");

  console.log("the Address tho : " + accountExist + "\n");

  return accountExist;
};

const sendUserOpStackup = async (userOpBuilder: any) => {
  try {
    // create & init client
    const client = await Client.init(process.env.BUNDLER_RPC_URL_STACK || "");
    console.log(`4.b)  client is init`);

    const UserOp = await client.buildUserOperation(userOpBuilder);

    console.log({ UserOp });

    console.log(`5) Built User Operation with client built`);

    const response = await client.sendUserOperation(userOpBuilder);
    const userOperationEvent = await response.wait();
    console.log("Waiting for transaction...");

    console.log(
      `6) Transaction sent : ${userOperationEvent?.transactionHash ?? null}`
    );
  } catch (error) {
    console.log(error);
  }
};
const sendUserOpPimlico = async (userOpBuilder: any) => {
  /*    
const pimlicoProvider = new ethers.providers.StaticJsonRpcProvider(
  pimlicoEndpoint
);

const result = await pimlicoProvider.send("pm_sponsorUserOperation", [
  userOperation,
  { entryPoint: entryPoint },
]);
const paymasterAndData = result.paymasterAndData; */
};

// do Batch transactions
// add execution of zapper
const formalizeBatch = async () => {};
