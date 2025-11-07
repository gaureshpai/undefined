import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: [
        process.env.NEXT_PUBLIC_ADMIN_PRIVATE_KEY || "0x4976097baa692aeba712bd64cc564187641819b60d521b64502cd701e257024e",
      ],
    },
    hardhat: {
      chainId: 31337,
    },
  },
};

export default config;
