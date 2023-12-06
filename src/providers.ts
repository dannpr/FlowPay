import { providers, ethers } from "ethers";

export const provider = new providers.JsonRpcProvider(
  process.env.BUNDLER_RPC_URL_STACK || ""
);

export const bundler = new providers.JsonRpcProvider(process.env.RPC_URL || "");

export const paymasterProvider = new ethers.providers.StaticJsonRpcProvider(
  process.env.PAYMASTER_URL_STACK
);
