import { ethers, Wallet } from "ethers";
import { randomBytes } from "crypto";
import { walletFactoryContract } from "./../contract";

import dotenv from "dotenv";
dotenv.config();

export async function preCreateInAccount() {
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
