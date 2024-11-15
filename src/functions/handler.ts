import middy from "@middy/core";
import secretsManager from "@middy/secrets-manager";

import { BRIDGE_PAIR } from "../consts";

import { IContext } from "../interfaces";
import { heimdall, teleport } from "./actions";

const secretsManagerOptions = secretsManager({
  fetchData: { apiToken: "mainnet/neopie" },
  awsClientOptions: { region: "us-east-1" },
  setToContext: true,
});

const mint = middy(async (event: any, context: IContext) => {
  const promises = BRIDGE_PAIR.map(async (pair) => {
    await heimdall({
      privatekey: context.apiToken.EVM_PRIVATEKEY,
      evmChain: pair.dest,
      neoChain: pair.base,
      tableName: `HEIMDALL_${pair.dest.key}`,
    });
  });
  await Promise.all(promises);
}).use(secretsManagerOptions);

const unlock = middy(async (event: any, context: IContext) => {
  const promises = BRIDGE_PAIR.map(async (pair) => {
    await teleport({
      privatekey: context.apiToken.NEO_PRIVATEKEY,
      neoChain: pair.base,
      evmChain: pair.dest,
      tableName: `TELEPORT_${pair.dest.key}`,
    });
  });
  await Promise.all(promises);
}).use(secretsManagerOptions);

export { mint, unlock };
