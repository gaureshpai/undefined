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
        process.env.NEXT_PUBLIC_ADMIN_PRIVATE_KEY || "0x94b1eef6aa03d83d8c5632ac792b9324aa1445832d9ba404ded5ad28d9c0af62",
      ],
    },
    hardhat: {
      chainId: 31337,
    },
  },
};

export default config;
