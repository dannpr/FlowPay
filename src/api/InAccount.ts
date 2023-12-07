import { ethers, BigNumber } from "ethers";
import { concat } from "ethers/lib/utils";
import { randomBytes } from "crypto";
import {
  entrypointContract,
  walletContract,
  walletFactoryContract,
} from "./../contract";
import { getUserOperationBuilder } from "./createUserOpBuilder";
import { bundler, provider } from "../providers";
import { Client, IUserOperation, Presets } from "userop";
import dotenv from "dotenv";
import { defaultAbiCoder } from "ethers/lib/utils";

dotenv.config();

export async function CreatePayflowAccount(
  toAddress: string,
  value: BigNumber
) {
  try {
    // Generate a random salt, convert it to hexadecimal, and prepend "0x"
    const salt = "0x" + randomBytes(32).toString("hex");

    // signer creation
    const privateKey = ethers.Wallet.createRandom().privateKey;

    console.log("1) Key us generated : private key => ", privateKey, "\n");
    const signer = new ethers.Wallet(privateKey);
    const signerAddress = signer.address;

    // Call the getAddress function from the wallet factory contract with the signers and salt
    // This computes the counterfactual address for the wallet without deploying it
    const walletAddress = await walletFactoryContract.getAddress(
      signerAddress,
      salt
    );

    console.log("2) Wallet address is computed : ", walletAddress, "\n");

    /*     // set the data to be sent to the wallet factory contract
    const data = walletFactoryContract.interface.encodeFunctionData(
      "createAccount",
      [process.env.ADDRESS, salt]
    );

    // Initialize the initCode which will be used to deploy a new wallet
    const initCode = concat([walletFactoryContract.address, data]);

    // Get the nonce for the wallet address with a key of 0
    const nonce: BigNumber = await entrypointContract.getNonce(
      walletAddress,
      0
    );

    // Encode the call data for the execute method
    const encodedCallData = walletContract.interface.encodeFunctionData(
      "execute",
      [toAddress, value, initCode]
    );

    // Get the user operation builder with the necessary parameters
    const userOpBuilder = await getUserOperationBuilder(
      walletContract.address,
      nonce,
      initCode,
      encodedCallData
    );

    console.log("3) User Opération is built : ", userOpBuilder, "\n");

    userOpBuilder.useMiddleware(Presets.Middleware.getGasPrice(provider));

    // init client
    const client = await Client.init(process.env.BUNDLER_RPC_URL_STACK || "");
    console.log(`4) init client`);

    await client.buildUserOperation(userOpBuilder);

    // user Op to send ETH
    const userOp = userOpBuilder.getOp();

    console.log("5) Final User Opération waiting sig : ", userOp, "\n");

    // userOp hashing
    const userOpHash = await entrypointContract.getUserOpHash(userOp);

    console.log("6) User Opération Hash : ", userOpHash, "\n");

    // userOp signing
    const signature = await signer.signMessage(userOpHash);
    const signedUserOp: IUserOperation = {
      ...userOp,
      signature,
    };

    console.log({ signedUserOp });
    console.log(
      "7) User Opération Signature : %s and signed userOp : %s",
      signature,
      signedUserOp,
      "\n"
    );

    // userOp sending
    // this version is when I have a better understand
    // const res = await client.sendUserOperation(signedUserOp);

    const FinalUserOpHash = await bundler.send("eth_sendUserOperation", [
      userOp,
      entrypointContract.address,
    ]);

    console.log("8) Final User Opération Hash sent : ", FinalUserOpHash, "\n"); */
  } catch (error) {
    console.log(error);
  }
}
