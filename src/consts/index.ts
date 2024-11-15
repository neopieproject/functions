export const NEO_RPC_URL = "http://seed1.neo.org:10332";
export const NEOX_RPC_URL = "https://mainnet-1.rpc.banelabs.org";

export const BRIDGE_PAIR = [
  {
    base: {
      key: "NEO",
      name: "Neo",
      chainId: 888,
      address: "0xfd0019bb60db9abaa52868cc6be69fe33a949804", // Teleport on N3
      rpc: NEO_RPC_URL,
      requiredConfirmations: 5,
    },
    dest: {
      key: "NEOX",
      name: "Neo X",
      chainId: 47763,
      address: "0xf9EA22DD0044f23E428F939B1eD105Ea79136C8e", // Heimdall on Neo X
      rpc: NEOX_RPC_URL,
      requiredConfirmations: 5,
    },
  },
];
