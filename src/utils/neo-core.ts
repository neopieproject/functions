import { CONST, rpc, sc, tx, u } from "@cityofzion/neon-core";
import { convertContractCallParam } from "./parser";
import { InvokeResult, RPCClient } from "@cityofzion/neon-core/lib/rpc";

export class Neo {
  public rpcClient: RPCClient;

  constructor(rpcUrl: string) {
    this.rpcClient = new rpc.RPCClient(rpcUrl);
  }

  invokeWithPrivateKey = async (
    privateKey: string,
    invokeScript: sc.ContractCallJson & {
      extraSystemFee?: string;
      signers: any[];
    }
  ) => {
    const version = await this.rpcClient.getVersion();
    const txObj = await this.#build(invokeScript);
    txObj.sign(privateKey, version.protocol.network);
    const txid = await this.rpcClient.sendRawTransaction(txObj);
    return {
      txid,
      nodeUrl: this.rpcClient.url,
    };
  };

  readContract = async (
    scripts: sc.ContractCallJson[]
  ): Promise<InvokeResult> => {
    const sb = new sc.ScriptBuilder();
    scripts.forEach((script) => {
      let params: unknown[] = [];
      if (script.args) {
        params = script.args.map((arg) => convertContractCallParam(arg as any));
      }
      sb.emitAppCall(script.scriptHash, script.operation, params);
    });
    return this.rpcClient.invokeScript(u.HexString.fromHex(sb.build()));
  };

  #createScript = (invokeScript: sc.ContractCallJson) => {
    return sc.createScript({
      scriptHash: invokeScript.scriptHash,
      operation: invokeScript.operation,
      args: invokeScript.args
        ? invokeScript.args.map((param: any) => convertContractCallParam(param))
        : [],
    });
  };

  #build = async (
    invokeScript: sc.ContractCallJson & {
      extraSystemFee?: string;
      signers: any[];
    }
  ): Promise<tx.Transaction> => {
    const currentHeight = await this.rpcClient.getBlockCount();
    const script = this.#createScript(invokeScript);
    const transaction = new tx.Transaction({
      validUntilBlock: currentHeight + 1,
      script,
      signers: invokeScript.signers,
    });

    transaction.networkFee = await this.#calculateNetworkFee(transaction);
    const systemFee = await this.#calculateSystemFee(transaction);
    transaction.systemFee = systemFee;
    if (invokeScript.extraSystemFee) {
      const fee = u.BigInteger.fromDecimal(
        invokeScript.extraSystemFee,
        8
      ).toString();
      transaction.systemFee = systemFee.add(parseFloat(fee));
    }
    return transaction;
  };

  #handleInvokeFunctionResponse = (invokeFunctionResponse: any) => {
    if (invokeFunctionResponse.state !== "HALT") {
      throw new Error(
        invokeFunctionResponse.exception
          ? invokeFunctionResponse.exception
          : "Failed"
      );
    }
  };

  #calculateNetworkFee = async (
    transaction: tx.Transaction
  ): Promise<u.BigInteger> => {
    const invokeFunctionResponse = await this.rpcClient.invokeFunction(
      CONST.NATIVE_CONTRACT_HASH.PolicyContract,
      "getFeePerByte"
    );

    this.#handleInvokeFunctionResponse(invokeFunctionResponse);

    const feePerByte = u.BigInteger.fromNumber(
      invokeFunctionResponse.stack[0].value as string
    );
    const transactionByteSize = transaction.serialize().length / 2 + 109;
    const witnessProcessingFee = u.BigInteger.fromNumber(
      1000390 * (transaction.signers.length === 1 ? 1 : 3)
    );

    return feePerByte.mul(transactionByteSize).add(witnessProcessingFee);
  };

  #calculateSystemFee = async (transaction: tx.Transaction) => {
    const invokeFunctionResponse = await this.rpcClient.invokeScript(
      transaction.script,
      transaction.signers
    );
    this.#handleInvokeFunctionResponse(invokeFunctionResponse);
    return u.BigInteger.fromNumber(invokeFunctionResponse.gasconsumed);
  };
}
