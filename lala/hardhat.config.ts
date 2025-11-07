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
        process.env.NEXT_PUBLIC_ADMIN_PRIVATE_KEY || "0x3eba8a46b66e72f6e25c8c71f5ca357ab68327aa11e1f6ddfa36fd7501451b01",
      ],
    },
    hardhat: {
      chainId: 31337,
    },
  },
};

export default config;
