import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { IBridgeChain } from "../interfaces";
import { getBurnDetail, getNextMintNo, mint } from "../functions/heimdall";
import { unlock, getLockDetail, getNextUnLockNo } from "../functions/teleport";
import { countConfirmations, isProcessing } from "../functions/helpers";
import { Neo } from "../utils/neo-core";
import { ethers, lock } from "ethers";

const client = new DynamoDBClient({
  region: "us-east-1", // Make sure this is the correct region
});
const docClient = DynamoDBDocumentClient.from(client);

interface IBridgeLockArgs {
  privatekey: string;
  evmChain: IBridgeChain;
  neoChain: IBridgeChain;
  tableName: string;
}

export const heimdall = async ({
  privatekey,
  evmChain,
  neoChain,
  tableName,
}: IBridgeLockArgs) => {
  const lockId = (await getNextMintNo(evmChain)).toString();
  const lockInfo = await getLockDetail(neoChain, lockId);
  if (lockInfo) {
    if (!(await isProcessing(tableName, lockId))) {
      if (
        (await countConfirmations(
          new Neo(neoChain.rpc).rpcClient,
          lockInfo.blockNo
        )) < neoChain.requiredConfirmations
      ) {
        return;
      }
      try {
        await mint(
          evmChain,
          lockInfo.no,
          lockInfo.neoTokenAddress,
          lockInfo.evmReceiver,
          ethers.parseUnits(lockInfo.amount.toString(), 18).toString(),
          privatekey
        );
        await docClient.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id: `${lockInfo.no}`,
              createdAt: Date.now(),
            },
          })
        );
      } catch (e) {
        console.log(e);
      }
    }
  } else {
    console.log(`Lock info of ${lockId} not found.`);
  }
};

export const teleport = async ({
  privatekey,
  evmChain,
  neoChain,
  tableName,
}: IBridgeLockArgs) => {
  const lockId = (await getNextUnLockNo(neoChain)).toString();
  const burnObj = await getBurnDetail(evmChain, lockId);
  if (burnObj[0].toString() === lockId) {
    const blockNo = parseInt(burnObj[7].toString(), 10);
    if (!(await isProcessing(tableName, lockId))) {
      const confirmations = await countConfirmations(
        new ethers.JsonRpcProvider(evmChain.rpc),
        blockNo
      );
      if (confirmations < evmChain.requiredConfirmations) {
        console.log(
          "not enough confirmations:" +
            (confirmations - evmChain.requiredConfirmations)
        );
        return;
      }
      try {
        await unlock(
          privatekey,
          lockId,
          neoChain.address,
          burnObj.evmTokenAddress,
          burnObj.sender,
          burnObj.receiver,
          ethers.formatUnits(burnObj.amount, 18)
        );
        await docClient.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id: lockId,
              createdAt: Date.now(),
            },
          })
        );
      } catch (e) {
        console.log(e);
      }
    }
  }
};
