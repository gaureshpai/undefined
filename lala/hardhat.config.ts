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
      url: "http://127.0.0.1:7546",
      chainId: 1337,
      accounts: [
        "0x007fba38fd0edf930d176b4ba9a05c9fed0409d1ec41a6aa982f2fc0f313831e"
      ],
    },
    hardhat: {
      chainId: 31337,
    },
  },
};

export default config;
