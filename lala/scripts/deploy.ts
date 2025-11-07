import { ethers } from "hardhat";

async function main() {
  console.log("Deploying PropertyRegistry contract...");

  const [deployer] = await ethers.getSigners();

  // Get the contract factory for PropertyRegistry
  const PropertyRegistry = await ethers.getContractFactory("PropertyRegistry");
  
  // Deploy the PropertyRegistry contract
  const propertyRegistry = await PropertyRegistry.deploy();
  await propertyRegistry.deployed();

  console.log("PropertyRegistry deployed to:", propertyRegistry.address);

  console.log("\nDeploying Fractionalizer contract...");

  // Get the contract factory for Fractionalizer
  const Fractionalizer = await ethers.getContractFactory("Fractionalizer");

  // Deploy the Fractionalizer contract, passing the PropertyRegistry address
  const fractionalizer = await Fractionalizer.deploy(propertyRegistry.address);
  await fractionalizer.deployed();

  console.log("Fractionalizer deployed to:", fractionalizer.address);

  // Optional: Register a sample property and fractionalize it
  console.log("\nRegistering sample property...");
  
  // Ensure the deployer is the owner of the PropertyRegistry to call registerProperty
  // The registerProperty function now takes the owner as an argument
  const tx = await propertyRegistry.registerProperty(
    "Green Villa",
    deployer.address, // The deployer will be the initial owner of the NFT
    "https://example.com/partnership-agreement.pdf", // Placeholder URL
    "https://example.com/maintenance-agreement.pdf", // Placeholder URL
    "https://example.com/rent-agreement.pdf", // Placeholder URL
    "https://example.com/green-villa.jpg" // Placeholder URL
  );
  await tx.wait();

  const propertyId = 1; // Assuming the first registered property gets ID 1
  const propertyDetails = await propertyRegistry.getProperty(propertyId);
  console.log("Registered Property Details:", propertyDetails);

  console.log("Sample property 'Green Villa' registered successfully!");

  console.log("\nFractionalizing the sample property...");

  // Fractionalize the NFT
  const fractionalizeTx = await fractionalizer.fractionalizeNFT(
    propertyId,
    "GreenVillaShares",
    "GVS",
    1000 // Total supply of fractional tokens
  );
  await fractionalizeTx.wait();

  const fractionalNFTAddress = await fractionalizer.nftFractions(propertyId);
  console.log("Fractional NFT contract deployed to:", fractionalNFTAddress);

  const FractionalNFT = await ethers.getContractFactory("FractionalNFT");
  const fractionalNFT = FractionalNFT.attach(fractionalNFTAddress);

  const deployerBalance = await fractionalNFT.balanceOf(deployer.address);
  console.log("Deployer's fractional token balance:", deployerBalance.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });