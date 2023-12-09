import WalletFactory from "./../contracts/abis/WalletFactory.sol/WalletFactory.json";
import Wallet from "./../contracts/abis/Wallet.sol/Wallet.json";
import entrypoint from "./../contracts/abis/EntryPoint.sol/entrypoint.json";
import { ethers, Contract } from "ethers";
import { provider } from "./providers";
import dotenv from "dotenv";
dotenv.config();

export const getWalletContract = (walletAddress: string) => {
  return new Contract(walletAddress, Wallet.abi, provider);
};

export const simpleAccountAbi = new ethers.utils.Interface(Wallet.abi);

export const entrypointContract = new Contract(
  process.env.ENTRYPOINT || "",
  entrypoint.abi,
  provider
);

export const walletFactoryContract = new Contract(
  process.env.WALLET_FACTORY_CONTRACT || "",
  WalletFactory.abi,
  provider
);
