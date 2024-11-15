import { Context } from "aws-lambda";

export interface IBridgeChain {
  name: string;
  rpc: string;
  chainId: number;
  address: string;
  requiredConfirmations: number;
}

export interface IContext extends Context {
  apiToken: {
    EVM_PRIVATEKEY: string;
    NEO_PRIVATEKEY: string;
    ALCHEMY_SECRET: string;
  };
}
