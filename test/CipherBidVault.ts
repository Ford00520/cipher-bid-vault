import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { CipherBidVault, CipherBidVault__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  charlie: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("CipherBidVault")) as CipherBidVault__factory;
  const contract = (await factory.deploy()) as CipherBidVault;
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("CipherBidVault", function () {
  let signers: Signers;
  let contract: CipherBidVault;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2],
      charlie: ethSigners[3],
    };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  it("should create an auction successfully", async function () {
    const tx = await contract
      .connect(signers.alice)
      .createAuction("Test Auction", "Test Description", 100, 24);
    await tx.wait();

    const auctionCount = await contract.getAuctionCount();
    expect(auctionCount).to.eq(1n);

    const auction = await contract.getAuction(1);
    expect(auction[1]).to.eq("Test Auction");
    expect(auction[2]).to.eq("Test Description");
    expect(auction[3]).to.eq(signers.alice.address);
    expect(auction[4]).to.eq(100n);
  });

  it("should allow placing encrypted bids", async function () {
    // Create auction
    await (await contract.connect(signers.alice).createAuction("Item A", "Description A", 100, 24)).wait();

    // Encrypt bid amount 200
    const clearBid = 200;
    const encryptedBid = await fhevm
      .createEncryptedInput(contractAddress, signers.bob.address)
      .add64(clearBid)
      .encrypt();

    // Place bid
    const tx = await contract
      .connect(signers.bob)
      .placeBid(1, encryptedBid.handles[0], encryptedBid.inputProof);
    await tx.wait();

    // Verify bid was stored
    const bidHandle = await contract.getBid(1, signers.bob.address);
    const decryptedBid = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      bidHandle,
      contractAddress,
      signers.bob,
    );

    expect(decryptedBid).to.eq(clearBid);
  });

  it.skip("should prevent creator from bidding on their own auction", async function () {
    await (await contract.connect(signers.alice).createAuction("Item B", "Description B", 100, 24)).wait();

    const encryptedBid = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add64(200)
      .encrypt();

    await expect(
      contract
        .connect(signers.alice)
        .placeBid(1, encryptedBid.handles[0], encryptedBid.inputProof)
    ).to.be.revertedWith("Creator cannot bid");
  });

  it("should allow multiple users to place bids", async function () {
    await (await contract.connect(signers.alice).createAuction("Item C", "Description C", 100, 24)).wait();

    // Bob places bid
    const bobBid = await fhevm
      .createEncryptedInput(contractAddress, signers.bob.address)
      .add64(200)
      .encrypt();
    await (await contract.connect(signers.bob).placeBid(1, bobBid.handles[0], bobBid.inputProof)).wait();

    // Charlie places bid
    const charlieBid = await fhevm
      .createEncryptedInput(contractAddress, signers.charlie.address)
      .add64(300)
      .encrypt();
    await (await contract.connect(signers.charlie).placeBid(1, charlieBid.handles[0], charlieBid.inputProof)).wait();

    // Verify both bids
    const bobBidHandle = await contract.getBid(1, signers.bob.address);
    const charlieBidHandle = await contract.getBid(1, signers.charlie.address);

    const bobDecrypted = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      bobBidHandle,
      contractAddress,
      signers.bob,
    );
    const charlieDecrypted = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      charlieBidHandle,
      contractAddress,
      signers.charlie,
    );

    expect(bobDecrypted).to.eq(200);
    expect(charlieDecrypted).to.eq(300);
  });

  it("should track user auctions and bids", async function () {
    await (await contract.connect(signers.alice).createAuction("Item D", "Description D", 100, 24)).wait();
    await (await contract.connect(signers.alice).createAuction("Item E", "Description E", 150, 24)).wait();

    const userAuctions = await contract.getUserAuctions(signers.alice.address);
    expect(userAuctions.length).to.eq(2);
    expect(userAuctions[0]).to.eq(1n);
    expect(userAuctions[1]).to.eq(2n);

    const bobBid = await fhevm
      .createEncryptedInput(contractAddress, signers.bob.address)
      .add64(200)
      .encrypt();
    await (await contract.connect(signers.bob).placeBid(1, bobBid.handles[0], bobBid.inputProof)).wait();

    const userBids = await contract.getUserBids(signers.bob.address);
    expect(userBids.length).to.eq(1);
    expect(userBids[0]).to.eq(1n);
  });

  it("should end auction after end time", async function () {
    await (await contract.connect(signers.alice).createAuction("Item F", "Description F", 100, 1)).wait();

    // Check auction is active
    const isActiveBefore = await contract.isAuctionActive(1);
    expect(isActiveBefore).to.eq(true);

    // Fast-forward past the auction end time
    const auctionBefore = await contract.getAuction(1);
    const endTime = auctionBefore[7];
    await time.increaseTo(endTime + 1n);

    // End auction
    const tx = await contract.endAuction(1);
    await tx.wait();

    const auction = await contract.getAuction(1);
    expect(auction[8]).to.eq(true); // ended
  });

  it("should finalize auction after ending", async function () {
    await (await contract.connect(signers.alice).createAuction("Item G", "Description G", 100, 1)).wait();

    // Fast-forward past the auction end time
    const auctionBefore = await contract.getAuction(1);
    const endTime = auctionBefore[7];
    await time.increaseTo(endTime + 1n);

    // End auction
    await (await contract.endAuction(1)).wait();

    // Finalize auction
    const tx = await contract.finalizeAuction(1);
    await tx.wait();

    const auction = await contract.getAuction(1);
    expect(auction[9]).to.eq(true); // finalized
  });
});
