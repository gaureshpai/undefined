/**
 * Ganache Account Mapping
 * Maps user emails to deterministic Ganache accounts
 * These are the default accounts from ganache-cli --deterministic
 */

export interface GanacheAccount {
  address: string;
  privateKey: string;
  balance: string; // Initial balance in ETH
}

export const GANACHE_ACCOUNTS: Record<string, GanacheAccount> = {
  // Account 0 - Reserved for admin/funding
  "jtuluve@gmail.co": {
    address: "0xa6f774867844e5fEd10ea25213F8336b49c7533E",
    privateKey: "0x32e796ffc858b0a72f3638a244c8d8cd1d37b7a5f936d419e3a879f943551519",
    balance: "100",
  },
  
  // Account 1
  "jtuluve@gmail.com": {
    address: "0xacdB8C87835879F4bFD24241CB80415F211C9Aea",
    privateKey: "0x4976097baa692aeba712bd64cc564187641819b60d521b64502cd701e257024e",
    balance: "100",
  },
  
  // Account 2
  "paigauresh@gmail.com": {
    address: "0x4cC738479A079E64Ee7A6C20B7b7951935bCbCC2",
    privateKey: "0x0f1d1bb79d1485b907ba682a64d3ba6104bd05272800eb972b7dca6a8554ab31",
    balance: "100",
  },
  
  // Account 3
  "user3@example.com": {
    address: "0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d",
    privateKey: "0x646f1ce2fdad0e6deeeb5c7e8e5543bdde65e86029e2fd9fc169899c440a7913",
    balance: "100",
  },
  
  // Account 4
  "user4@example.com": {
    address: "0xd03ea8624C8C5987235048901fB614fDcA89b117",
    privateKey: "0xadd53f9a7e588d003326d1cbf9e4a43c061aadd9bc938c843a79e7b4fd2ad743",
    balance: "100",
  },
  
  // Account 5
  "user5@example.com": {
    address: "0x95cED938F7991cd0dFcb48F0a06a40FA1aF46EBC",
    privateKey: "0x395df67f0c2d2d9fe1ad08d1bc8b6627011959b79c53d7dd6a3536a33ab8a4fd",
    balance: "100",
  },
  
  // Account 6
  "user6@example.com": {
    address: "0x3E5e9111Ae8eB78Fe1CC3bb8915d5D461F3Ef9A9",
    privateKey: "0xe485d098507f54e7733a205420dfddbe58db035fa577fc294ebd14db90767a52",
    balance: "100",
  },
  
  // Account 7
  "user7@example.com": {
    address: "0x28a8746e75304c0780E011BEd21C72cD78cd535E",
    privateKey: "0xa453611d9419d0e56f499079478fd72c37b251a94bfde4d19872c44cf65386e3",
    balance: "100",
  },
  
  // Account 8
  "user8@example.com": {
    address: "0xACa94ef8bD5ffEE41947b4585a84BdA5a3d3DA6E",
    privateKey: "0x829e924fdf021ba3dbbc4225edfece9aca04b929d6e75613329ca6f1d31c0bb4",
    balance: "100",
  },
  
  // Account 9
  "user9@example.com": {
    address: "0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e",
    privateKey: "0xb0057716d5917badaf911b193b12b910811c1497b5bada8d7711f758981c3773",
    balance: "100",
  },
};

/**
 * Get Ganache account by email
 */
export function getAccountByEmail(email: string): GanacheAccount | null {
  return GANACHE_ACCOUNTS[email.toLowerCase()] || null;
}

/**
 * Check if email has a mapped Ganache account
 */
export function hasGanacheAccount(email: string): boolean {
  return email.toLowerCase() in GANACHE_ACCOUNTS;
}

/**
 * Get all available user emails (excluding admin)
 */
export function getAvailableUserEmails(): string[] {
  return Object.keys(GANACHE_ACCOUNTS).filter(email => email !== "admin@example.com");
}
