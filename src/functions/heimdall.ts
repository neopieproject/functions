import { ethers } from "ethers";
import HEIMDALL_ABI from "../abi/Heimdall.json";
import { IBridgeChain } from "../interfaces";

const getContract = (chain: IBridgeChain, privateKey?: string) => {
  const provider = new ethers.JsonRpcProvider(chain.rpc);
  const wallet = privateKey
    ? new ethers.Wallet(privateKey, provider)
    : provider;
  return new ethers.Contract(chain.address, HEIMDALL_ABI, wallet);
};

export const getNextMintNo = async (chain: IBridgeChain) => {
  const contract = getContract(chain);
  return parseFloat(await contract.mintNo()) + 1;
};

export const getBurnDetail = async (
  chain: IBridgeChain,
  no: string | number
) => {
  const contract = getContract(chain);
  return await contract.getBurnDetail(no);
};

export const mint = async (
  chain: IBridgeChain,
  no: string,
  neoTokenAddress: string,
  receiver: string,
  amount: string,
  privateKey: string
) => {
  const contract = getContract(chain, privateKey);
  const feeData = await new ethers.JsonRpcProvider(chain.rpc).getFeeData();
  const tx = await contract.mint(no, neoTokenAddress, receiver, amount, {
    gasPrice: feeData.gasPrice,
  });
  const receipt = await tx.wait();
  console.log(
    `Transaction ${receipt.hash} has been mined in block ${receipt.blockNumber}`
  );
  return receipt;
};
