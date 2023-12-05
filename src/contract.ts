import WalletFactory from "./../contracts/abis/WalletFactory.sol/WalletFactory.json";
import Wallet from "./../contracts/abis/Wallet.sol/Wallet.json";
import entrypoint from "./../contracts/abis/EntryPoint.sol/entrypoint.json";
import { Contract, providers } from "ethers";

export const provider = new providers.JsonRpcProvider(
  process.env.BUNDLER_RPC_URL_STACK || ""
);

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
