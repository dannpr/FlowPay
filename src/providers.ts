import { providers, ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

export const provider = new providers.JsonRpcProvider(
  process.env.RPC_URL || ""
);

export const bundler = new providers.JsonRpcProvider(
  process.env.BUNDLER_RPC_URL_STACK || ""
);

/*
  If I have a contract 
  export const paymasterProvider = new ethers.providers.StaticJsonRpcProvider(
  process.env.PAYMASTER_URL_STACK
); */
