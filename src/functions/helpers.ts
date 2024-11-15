import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

const THRESOLD = 60000;

export const waitForConfirmations = async (
  providerOrClient,
  blockNo,
  minConfirmations = 50,
  interval = 10000
) => {
  let confirmations = 0;
  if (providerOrClient.getBlockNumber) {
    const currentBlock = await providerOrClient.getBlockNumber();
    confirmations = currentBlock - blockNo;
  } else {
    confirmations = (await providerOrClient.getBlock(blockNo, true))
      .confirmations;
  }
  if (confirmations < minConfirmations) {
    await new Promise((resolve) => setTimeout(resolve, interval));
    return waitForConfirmations(
      providerOrClient,
      blockNo,
      minConfirmations,
      interval
    );
  }
};

export const countConfirmations = async (providerOrClient, blockNo) => {
  let confirmations = 0;
  if (providerOrClient.getBlockNumber) {
    // ethers provider
    const currentBlock = await providerOrClient.getBlockNumber();
    confirmations = currentBlock - blockNo;
  } else {
    // neo client
    confirmations = (await providerOrClient.getBlock(blockNo, true))
      .confirmations;
  }
  return confirmations;
};

export const isProcessing = async (tableName: string, id: string) => {
  const currentTime = Date.now();
  const res = await docClient.send(
    new GetCommand({
      TableName: tableName,
      Key: {
        id,
      },
    })
  );

  if (!res.Item || res.Item.createdAt + THRESOLD < currentTime) {
    return false;
  } else {
    console.log("Found item: processing..");
    return true;
  }
};
