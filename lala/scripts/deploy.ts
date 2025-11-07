import { ethers } from "hardhat";

async function main() {
  console.log("Deploying PropertyRegistry contract...");

  // Get the contract factory
  const PropertyRegistry = await ethers.getContractFactory("PropertyRegistry");
  
  // Deploy the contract
  const propertyRegistry = await PropertyRegistry.deploy();
  await propertyRegistry.deployed();

  console.log("PropertyRegistry deployed to:", propertyRegistry.address);

  // Optional: Register a sample property after deployment
  console.log("\nRegistering sample property...");
  
  const owners = [
    "0x37f41DF9F35ea7a5EFdfBF5203fB8d4C442fc667",
    "0x628E0e4e85662bE09089c37753d34c5FF4539a32",
  ];
  const shares = [60, 40]; // Percentages that sum to 100

  const tx = await propertyRegistry.registerProperty(
    "Green Villa",
    owners,
    shares,
    "https://example.com/partnership-agreement.pdf", // Placeholder URL
    "https://example.com/maintenance-agreement.pdf", // Placeholder URL
    "https://example.com/rent-agreement.pdf", // Placeholder URL
    "https://example.com/green-villa.jpg" // Placeholder URL
  );
  await tx.wait();

  const ty = await propertyRegistry.getProperty(1);
  console.log("Registered Property Details:", ty);

  console.log("Sample property 'Green Villa' registered successfully!");
  console.log("Property Count:", (await propertyRegistry.propertyCount()).toString());

  console.log("\nDeploying MediatedTransfer contract...");

  // Get the contract factory
  const MediatedTransfer = await ethers.getContractFactory("MediatedTransfer");

  // Deploy the contract
  const mediatedTransfer = await MediatedTransfer.deploy(propertyRegistry.address);
  await mediatedTransfer.deployed();

  console.log("MediatedTransfer deployed to:", mediatedTransfer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
