import { tx, wallet } from "@cityofzion/neon-core";
import { IBridgeChain } from "../interfaces";
import { parseMapValue } from "../utils/parser";
import { Neo } from "../utils/neo-core";
import { NEO_RPC_URL } from "../consts";

function createScript(
  scriptHash: string,
  operation: string,
  args: any[],
  accountScriptHash?: string
) {
  const script = {
    operation,
    scriptHash,
    args,
  };

  if (accountScriptHash) {
    script["signers"] = [
      {
        account: accountScriptHash,
        scopes: tx.WitnessScope.CalledByEntry,
      },
    ];
  }

  return script;
}

function handleResponse(res: any) {
  if (res.state !== "HALT" || !res.stack[0]) {
    return undefined;
  }

  // In case of null return
  if (!res.stack[0].value) {
    return undefined;
  }

  if (typeof res.stack[0].value === "string") {
    return parseFloat(res.stack[0].value) + 1;
  } else {
    return parseMapValue(res.stack[0]);
  }
}

export const unlock = async (
  privatekey: string,
  no: string,
  address: string,
  evmTokenAddress: string,
  sender: string,
  receiver: string,
  amount: number | string
): Promise<string | undefined> => {
  const account = new wallet.Account(privatekey);
  const script = createScript(
    address,
    "unlock",
    [
      { type: "Integer", value: no },
      { type: "Hash160", value: evmTokenAddress },
      { type: "Hash160", value: sender },
      { type: "Hash160", value: receiver },
      { type: "Integer", value: amount },
    ],
    account.scriptHash
  );

  const res = await new Neo(NEO_RPC_URL).invokeWithPrivateKey(
    privatekey,
    script as any
  );
  console.log(
    `Unlocked ${amount} NEO tokens to ${receiver} with txid: ${res.txid}`
  );
  return res.txid;
};

export const getNextUnLockNo = async (
  chain: IBridgeChain
): Promise<number | undefined> => {
  const script = createScript(chain.address, "getUnlockNo", []);
  const res = await new Neo(chain.rpc).readContract([script]);
  return handleResponse(res);
};

export const getLockDetail = async (
  chain: IBridgeChain,
  no: string | number
): Promise<any | undefined> => {
  const script = createScript(chain.address, "getLock", [
    { type: "Integer", value: no },
  ]);
  const res = await new Neo(chain.rpc).readContract([script]);
  return handleResponse(res);
};
