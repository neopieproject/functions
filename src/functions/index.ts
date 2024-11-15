import { handlerPath } from "../utils/handler-resolver";

export default {
  // To handle Teleport's request to mint tokens on EVM
  mint: {
    handler: `${handlerPath(__dirname)}/handler.mint`,
    timeout: 60,
    events: [
      {
        schedule: "rate(1 minute)",
      },
    ],
  },
  // To handle Heimdall's request to unlock funds on Neo
  unlock: {
    handler: `${handlerPath(__dirname)}/handler.unlock`,
    timeout: 60,
    events: [
      {
        schedule: "rate(1 minute)",
      },
    ],
  },
};
