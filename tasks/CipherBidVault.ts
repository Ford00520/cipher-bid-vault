import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Tutorial: Deploy and Interact Locally (--network localhost)
 * ===========================================================
 *
 * 1. From a separate terminal window:
 *
 *   npx hardhat node
 *
 * 2. Deploy the CipherBidVault contract
 *
 *   npx hardhat --network localhost deploy
 *
 * 3. Interact with the CipherBidVault contract
 *
 *   npx hardhat --network localhost task:create-auction --title "Test" --description "Test Desc" --startingBid 100 --duration 24
 *   npx hardhat --network localhost task:place-bid --auctionId 1 --bidAmount 200
 *   npx hardhat --network localhost task:get-auction --auctionId 1
 *
 *
 * Tutorial: Deploy and Interact on Sepolia (--network sepolia)
 * ===========================================================
 *
 * 1. Deploy the CipherBidVault contract
 *
 *   npx hardhat --network sepolia deploy
 *
 * 2. Interact with the CipherBidVault contract
 *
 *   npx hardhat --network sepolia task:create-auction --title "Test" --description "Test Desc" --startingBid 100 --duration 24
 *   npx hardhat --network sepolia task:place-bid --auctionId 1 --bidAmount 200
 *   npx hardhat --network sepolia task:get-auction --auctionId 1
 *
 */

/**
 * Example:
 *   - npx hardhat --network localhost task:address
 *   - npx hardhat --network sepolia task:address
 */
task("task:address", "Prints the CipherBidVault address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const contract = await deployments.get("CipherBidVault");

  console.log("CipherBidVault address is " + contract.address);
});

/**
 * Example:
 *   - npx hardhat --network localhost task:create-auction --title "Test Auction" --description "Test Description" --startingBid 100 --duration 24
 *   - npx hardhat --network sepolia task:create-auction --title "Test Auction" --description "Test Description" --startingBid 100 --duration 24
 */
task("task:create-auction", "Creates a new auction")
  .addOptionalParam("address", "Optionally specify the CipherBidVault contract address")
  .addParam("title", "The auction title")
  .addParam("description", "The auction description")
  .addParam("startingBid", "The starting bid amount")
  .addParam("duration", "The auction duration in hours")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const contractDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("CipherBidVault");
    console.log(`CipherBidVault: ${contractDeployment.address}`);

    const signers = await ethers.getSigners();
    const contract = await ethers.getContractAt("CipherBidVault", contractDeployment.address);

    const startingBid = parseInt(taskArguments.startingBid);
    const duration = parseInt(taskArguments.duration);

    if (!Number.isInteger(startingBid) || startingBid <= 0) {
      throw new Error(`Argument --startingBid must be a positive integer`);
    }
    if (!Number.isInteger(duration) || duration <= 0) {
      throw new Error(`Argument --duration must be a positive integer`);
    }

    const tx = await contract
      .connect(signers[0])
      .createAuction(taskArguments.title, taskArguments.description, startingBid, duration);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    const auctionCount = await contract.getAuctionCount();
    console.log(`Auction created! Total auctions: ${auctionCount}`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:place-bid --auctionId 1 --bidAmount 200
 *   - npx hardhat --network sepolia task:place-bid --auctionId 1 --bidAmount 200
 */
task("task:place-bid", "Places an encrypted bid on an auction")
  .addOptionalParam("address", "Optionally specify the CipherBidVault contract address")
  .addParam("auctionId", "The auction ID")
  .addParam("bidAmount", "The bid amount")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const bidAmount = parseInt(taskArguments.bidAmount);
    if (!Number.isInteger(bidAmount) || bidAmount <= 0) {
      throw new Error(`Argument --bidAmount must be a positive integer`);
    }

    await fhevm.initializeCLIApi();

    const contractDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("CipherBidVault");
    console.log(`CipherBidVault: ${contractDeployment.address}`);

    const signers = await ethers.getSigners();
    const contract = await ethers.getContractAt("CipherBidVault", contractDeployment.address);

    // Encrypt the bid amount
    const encryptedBid = await fhevm
      .createEncryptedInput(contractDeployment.address, signers[0].address)
      .add64(bidAmount)
      .encrypt();

    const tx = await contract
      .connect(signers[0])
      .placeBid(parseInt(taskArguments.auctionId), encryptedBid.handles[0], encryptedBid.inputProof);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`Bid placed successfully!`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:get-auction --auctionId 1
 *   - npx hardhat --network sepolia task:get-auction --auctionId 1
 */
task("task:get-auction", "Gets auction details")
  .addOptionalParam("address", "Optionally specify the CipherBidVault contract address")
  .addParam("auctionId", "The auction ID")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const contractDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("CipherBidVault");
    console.log(`CipherBidVault: ${contractDeployment.address}`);

    const contract = await ethers.getContractAt("CipherBidVault", contractDeployment.address);

    const auction = await contract.getAuction(parseInt(taskArguments.auctionId));
    console.log(`Auction ID: ${auction[0]}`);
    console.log(`Title: ${auction[1]}`);
    console.log(`Description: ${auction[2]}`);
    console.log(`Creator: ${auction[3]}`);
    console.log(`Starting Bid: ${auction[4]}`);
    console.log(`End Time: ${new Date(Number(auction[7]) * 1000).toLocaleString()}`);
    console.log(`Ended: ${auction[8]}`);
    console.log(`Finalized: ${auction[9]}`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:get-bid --auctionId 1 --bidder <address>
 *   - npx hardhat --network sepolia task:get-bid --auctionId 1 --bidder <address>
 */
task("task:get-bid", "Gets a user's bid for an auction")
  .addOptionalParam("address", "Optionally specify the CipherBidVault contract address")
  .addParam("auctionId", "The auction ID")
  .addParam("bidder", "The bidder address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const contractDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("CipherBidVault");
    console.log(`CipherBidVault: ${contractDeployment.address}`);

    const signers = await ethers.getSigners();
    const bidderAddress = taskArguments.bidder || signers[0].address;
    const contract = await ethers.getContractAt("CipherBidVault", contractDeployment.address);

    const bidHandle = await contract.getBid(parseInt(taskArguments.auctionId), bidderAddress);
    if (bidHandle === ethers.ZeroHash) {
      console.log(`No bid found for auction ${taskArguments.auctionId} by ${bidderAddress}`);
      return;
    }

    const clearBid = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      bidHandle,
      contractDeployment.address,
      signers[0],
    );
    console.log(`Bid amount: ${clearBid}`);
  });

