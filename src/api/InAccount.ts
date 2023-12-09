import { address } from "./../../contracts/lib/erc20-paymaster-contracts/lib/account-abstraction/test/solidityTypes";
import { ethers, BigNumber } from "ethers";
import { concat } from "ethers/lib/utils";
import { randomBytes } from "crypto";
import {
  entrypointContract,
  getWalletContract,
  walletFactoryContract,
} from "./../contract";
import {
  getUserOperationBuilder /* ,
  getPaymasterData, */,
} from "./createUserOpBuilder";
import { bundler, provider } from "../providers";
import { Client, IUserOperation, Presets } from "userop";
import dotenv from "dotenv";
import { defaultAbiCoder } from "ethers/lib/utils";
import { EOASignature } from "userop/dist/preset/middleware";

dotenv.config();

export async function CreatePayflowAccount(
  toAddress: string,
  value: BigNumber
) {
  try {
    // Generate a random salt, convert it to hexadecimal, and prepend "0x"
    const salt = "0x" + randomBytes(32).toString("hex");
    const tstSalt = process.env.TST_SALT || "";

    console.log("0) Salt is generated : ", tstSalt, "\n");

    // signer creation
    const privateKey = ethers.Wallet.createRandom().privateKey;
    const tstPrivateKey = process.env.TST_PRIVATE_KEY || "";

    console.log("1.a) Key us generated : private key => ", tstPrivateKey, "\n");

    const signer = new ethers.Wallet(privateKey);
    const signerAddress = signer.address;

    const tstSigner = new ethers.Wallet(tstPrivateKey, provider);
    const tstSignerAddress = tstSigner.address;

    console.log("1.b) Key us generated : address => ", tstSignerAddress, "\n");

    // Call the getAddress function from the wallet factory contract with the signers and salt
    // This computes the counterfactual address for the wallet without deploying it
    const walletAddress = await walletFactoryContract.getAddress(
      tstSignerAddress,
      tstSalt
    );

    console.log(
      "2) Wallet address is computed not deployed : ",
      walletAddress,
      "\n"
    );

    // set the data to be sent to the wallet factory contract
    const data = walletFactoryContract.interface.encodeFunctionData(
      "createAccount",
      [tstSignerAddress, tstSalt]
    );

    const decodeData = walletFactoryContract.interface.decodeFunctionData(
      "createAccount(address, uint256)",
      data
    );

    // Initialize the initCode which will be used to deploy a new wallet
    const initCode = concat([walletFactoryContract.address, data]);

    console.log(decodeData, "\n");

    // Get the nonce for the wallet address with a key of 0
    const nonce: BigNumber = await entrypointContract.getNonce(
      walletAddress,
      0
    );

    //get wallet contract
    // maybe we can do simpler
    const walletContract = getWalletContract(walletAddress);

    console.log(walletContract.address, "\n");

    // Encode the call data for the execute method
    // other way to do it
    // const encodedCallData =  simpleAccountAbi.encodeFunctionData("execute", [toAddress, value, initCode]);
    const encodedCallData = walletContract.interface.encodeFunctionData(
      "execute",
      [toAddress, value, initCode]
    );

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

    // user Op to send ETH ( 0 )
    /*     const userOp = userOpBuilder.getOp();
    const userOpH = await entrypointContract.getUserOpHash(userOp);
    const getUserOpSign = await tstSigner.signMessage(
      ethers.utils.arrayify(userOpH)
    );

    console.log(
      "5) Final User Opération waiting sig : ",
      userOp,
      "\n user Op hash :",
      userOpH,
      "\n user Op signature before paymaster and all :",
      getUserOpSign,
      "\n"
    );
 */
    // userOp signing
    // const signature = await tstSigner.signMessage(userOpHash);
    /*     const signedUserOp: IUserOperation = {
      ...userOp,
      signature,
    }; */

    // build the userOp again with the signature
    /* const signedUserOpBuilder = await getUserOperationBuilder(
      walletContract.address,
      nonce,
      encodedCallData,
      signature
    );
 */
    const paymasterContext = { type: "payg" };
    const paymasterUrl: string = process.env.PAYMASTER_URL_STACK || "";

    // userOp hashing
    userOpBuilder
      .useMiddleware(Presets.Middleware.getGasPrice(provider))
      /* 
        const userOpHash = await entrypointContract.getUserOpHash(
          signedUserOpBuilder
        );
        const signature = await tstSigner.signMessage(
          ethers.utils.arrayify(userOpHash)
      ); 
            // .setSignature(signature);

    */
      .useMiddleware(Presets.Middleware.signUserOpHash(tstSigner))
      // paymaster middleware working on certain cases and depending on the funds that you have because it calculate your account
      .useMiddleware(
        Presets.Middleware.verifyingPaymaster(paymasterUrl, paymasterContext)
      );

    console.log(`4.b)  Gas price and signature are set`);

    // create client
    // Init client
    const client = await Client.init(process.env.BUNDLER_RPC_URL_STACK || "");
    console.log(`4.b)  client is init`); /*

    /*  console.log(
          "6) User Opération Hash : %s and signed userOp hash : %s",
          userOpHash,
          signature,
          "\n"
        );*/

    /*     const userOpHash = await entrypointContract.getUserOpHash(userOp);
    const getUserOpS = await tstSigner.signMessage(
      ethers.utils.arrayify(userOpHash)
    );

    console.log(
      "7) User Opération signed and built : ",
      signedUserOpBuilder,
      " \n User Op hash :",
      userOpHash,
      "\n user Op signature after signature :",
      getUserOpS,
      "\n"
    ); */

    const UserOp = await client.buildUserOperation(userOpBuilder);

    console.log({ UserOp });

    console.log(`5) Built User Operation with client built`);

    const response = await client.sendUserOperation(userOpBuilder);
    const userOperationEvent = await response.wait();

    console.log(
      `6) Transaction sent : ${userOperationEvent?.transactionHash ?? null}`
    );

    /*
    
    console.log(
      "8) Signed User Opération Hash sent : ",
      signedUserOpBuilder,
      "\n"
    );

    
    // userOp sending
    // this version is when I have a better understand
    // const res = await client.sendUserOperation(signedUserOp);

    const FinalUserOpHash = await bundler.send("eth_sendUserOperation", [
      userOp,
      entrypointContract.address,
    ]);

    console.log("8) Final User Opération Hash sent : ", FinalUserOpHash, "\n"); 
    */
  } catch (error) {
    console.log(error);
  }
}
