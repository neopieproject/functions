import { sc, u, wallet } from "@cityofzion/neon-core";
import {
  StackItemLike,
  StackItemMap,
} from "@cityofzion/neon-core/lib/sc/StackItem";

const converterMapping = {
  Address: (value) =>
    sc.ContractParam.hash160(wallet.getScriptHashFromAddress(value)),
  Hash160: (value) => sc.ContractParam.hash160(value),
  String: (value) => sc.ContractParam.string(value),
  Integer: (value) => sc.ContractParam.integer(value),
  Array: (value) =>
    sc.ContractParam.array(...value.map(convertContractCallParam)),
  ByteArray: (value) =>
    sc.ContractParam.byteArray(u.hex2base64(u.str2hexstring(value))),
};

export const convertContractCallParam = ({ type, value }) => {
  const converter = converterMapping[type];
  if (converter) return converter(value);
  throw new Error("No support param");
};

export const base64ToAddress = (str) =>
  wallet.getAddressFromScriptHash(u.reverseHex(u.base642hex(str)));
export const base64ToHash160 = (str) => "0x" + u.reverseHex(u.base642hex(str));
export const base64ToString = (str) =>
  u.HexString.fromBase64(str).toAscii().toString();
export const base64ToFixed8 = (str) =>
  u.BigInteger.fromNumber(str).toDecimal(8);

export function truncateDecimal(v, p) {
  const s = Math.pow(10, p || 0);
  return Math.trunc(s * v) / s;
}

const classifier = {
  address: base64ToAddress,
  string: base64ToString,
  hash160: base64ToHash160,
  int: parseFloat,
  options: (value) => value.map((v) => base64ToString(v.value)),
  items: (value) => value.map(parseMapValue),
};

const classificationKeys = {
  address: ["owner", "account", "creator", "sender"],
  string: [
    "name",
    "manifest",
    "tokenId",
    "tokenASymbol",
    "tokenBSymbol",
    "symbol",
    "symbolA",
    "symbolB",
    "title",
    "description",
    "author",
  ],
  hash160: [
    "contractHash",
    "tokenA",
    "tokenB",
    "tokenIn",
    "tokenOut",
    "neoTokenAddress",
    "evmTokenAddress",
    "evmReceiver",
  ],
  int: [
    "blockNo",
    "start",
    "end",
    "deposit",
    "totalItems",
    "totalPages",
    "no",
    "amount",
    "amountA",
    "amountB",
    "amountIn",
    "amountOut",
    "totalShare",
    "tokenADecimals",
    "tokenBDecimals",
    "claimable",
    "currentAPR",
    "TVL",
    "APR",
    "rewardsPerDay",
    "chainId",
  ],
  date: ["createdAt"],
};

const getClassificationKey = (key) =>
  Object.entries(classificationKeys).find(([_, values]) =>
    values.includes(key)
  )[0];

export const parseMapValue = ({ value: root }: StackItemLike): any => {
  const obj = {};
  (root as StackItemMap[]).forEach(({ key, value }) => {
    if (value.value !== undefined) {
      const _key = u.base642utf8(key.value as string);
      const classKey = getClassificationKey(_key);
      obj[_key] = classifier[classKey]
        ? classifier[classKey](value.value)
        : value.value;
    }
  });
  return obj;
};
