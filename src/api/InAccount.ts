import { address } from "./../../contracts/lib/erc20-paymaster-contracts/lib/account-abstraction/test/solidityTypes";
import { ethers, BigNumber } from "ethers";
import { concat } from "ethers/lib/utils";
import { randomBytes } from "crypto";
import {
  entrypointContract,
  walletContract,
  walletFactoryContract,
} from "./../contract";
import { provider } from "./../providers";
import { Presets, UserOperationBuilder } from "userop";

import dotenv from "dotenv";
dotenv.config();

export async function CreatePayflow(toAddress: string, value: BigNumber) {
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

  // set the data to be sent to the wallet factory contract
  const data = walletFactoryContract.interface.encodeFunctionData(
    "createAccount",
    [process.env.ADDRESS, salt]
  );

  // Initialize the initCode which will be used to deploy a new wallet
  const initCode = concat([walletFactoryContract.address, data]);

  // Get the nonce for the wallet address with a key of 0
  const nonce: BigNumber = await entrypointContract.getNonce(walletAddress, 0);

  // Encode the call data for the execute method
  const encodedCallData = walletContract.interface.encodeFunctionData(
    "execute",
    [toAddress, value, initCode]
  );

  // create a User Op builder

  const userOpBuilder = new UserOperationBuilder()
    .useDefaults({
      sender: walletAddress,
    })
    .setInitCode(walletFactoryContract.address + data)
    .useMiddleware(Presets.Middleware.getGasPrice(provider))
    .setCallData("0x")
    .setNonce(await entrypointContract.getNonce(walletAddress, 0));

  /* console.log("Bundler API :", bundlerRPCUrl);

  // get paymaster
  const opts = await optsPM();

  // Create a new Smart Account builder
  const simpleAccount = await Presets.Builder.SimpleAccount.init(
    signer,
    bundlerRPCUrl,
    opts
  ); */
}
