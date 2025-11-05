import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { CipherBidVault } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

describe("CipherBidVaultSepolia", function () {
  let signers: Signers;
  let contract: CipherBidVault;
  let contractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const CipherBidVaultDeployment = await deployments.get("CipherBidVault");
      contractAddress = CipherBidVaultDeployment.address;
      contract = await ethers.getContractAt("CipherBidVault", CipherBidVaultDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0], bob: ethSigners[1] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("should create auction and place encrypted bid", async function () {
    steps = 8;

    this.timeout(4 * 40000);

    progress(`Creating auction on CipherBidVault=${contractAddress}...`);
    let tx = await contract.connect(signers.alice).createAuction("Sepolia Test Auction", "Test Description", 100, 24);
    await tx.wait();

    progress(`Getting auction count...`);
    const auctionCount = await contract.getAuctionCount();
    expect(auctionCount).to.be.gt(0n);

    progress(`Encrypting bid amount '200'...`);
    const encryptedBid = await fhevm
      .createEncryptedInput(contractAddress, signers.bob.address)
      .add64(200)
      .encrypt();

    progress(
      `Call placeBid(1) CipherBidVault=${contractAddress} handle=${ethers.hexlify(encryptedBid.handles[0])} signer=${signers.bob.address}...`,
    );
    tx = await contract
      .connect(signers.bob)
      .placeBid(1, encryptedBid.handles[0], encryptedBid.inputProof);
    await tx.wait();

    progress(`Call getBid(1, ${signers.bob.address})...`);
    const bidHandle = await contract.getBid(1, signers.bob.address);
    expect(bidHandle).to.not.eq(ethers.ZeroHash);

    progress(`Decrypting bid handle=${bidHandle}...`);
    const clearBid = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      bidHandle,
      contractAddress,
      signers.bob,
    );
    progress(`Clear bid amount=${clearBid}`);

    expect(clearBid).to.eq(200);
  });

  it("should track user auctions", async function () {
    steps = 4;

    this.timeout(2 * 40000);

    progress(`Creating auction...`);
    const tx = await contract.connect(signers.alice).createAuction("Another Auction", "Another Description", 150, 24);
    await tx.wait();

    progress(`Getting user auctions for ${signers.alice.address}...`);
    const userAuctions = await contract.getUserAuctions(signers.alice.address);
    progress(`User has ${userAuctions.length} auctions`);

    expect(userAuctions.length).to.be.gt(0);
  });
});

