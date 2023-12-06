import WalletFactory from "./../contracts/abis/WalletFactory.sol/WalletFactory.json";
import Wallet from "./../contracts/abis/Wallet.sol/Wallet.json";
import entrypoint from "./../contracts/abis/EntryPoint.sol/entrypoint.json";
import { Contract } from "ethers";
import { provider } from "./providers";

export const walletContract = new Contract(
  process.env.WALLET_CONTRACT || "",
  Wallet.abi,
  provider
);

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
