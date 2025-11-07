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
        "0xccd4aa1d513ca5e9d9deb40ce13481fb6e7d5866dfde8df3e6459021ae179579"
      ],
    },
    hardhat: {
      chainId: 31337,
    },
  },
};

export default config;
