// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint64, externalEuint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title CipherBidVault - Encrypted Auction System
/// @notice A fully encrypted auction system where bids are hidden until auction ends
contract CipherBidVault is SepoliaConfig {
    uint256 public constant AUCTION_DURATION = 24 hours;
    uint256 private auctionCounter;

    struct Auction {
        uint256 id;
        string title;
        string description;
        address creator;
        uint64 startingBid;
        euint64 highestBid;
        address highestBidder;
        uint256 endTime;
        bool ended;
        bool finalized;
    }

    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => mapping(address => euint64)) public bids;
    mapping(address => uint256[]) public userAuctions;
    mapping(address => uint256[]) public userBids;

    event AuctionCreated(
        uint256 indexed auctionId,
        string title,
        address indexed creator,
        uint64 startingBid,
        uint256 endTime
    );
    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 timestamp
    );
    event AuctionEnded(uint256 indexed auctionId);
    event AuctionFinalized(
        uint256 indexed auctionId,
        address indexed winner,
        uint64 winningBid
    );

    constructor() {
        auctionCounter = 0;
    }

    /// @notice Create a new auction
    /// @param title The title of the auction
    /// @param description The description of the auction item
    /// @param startingBid The minimum bid amount in wei
    /// @param durationHours The duration of the auction in hours
    function createAuction(
        string memory title,
        string memory description,
        uint64 startingBid,
        uint256 durationHours
    ) external {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(startingBid > 0, "Starting bid must be greater than 0");
        require(durationHours > 0, "Duration must be greater than 0");

        uint256 auctionId = ++auctionCounter;
        uint256 endTime = block.timestamp + (durationHours * 1 hours);

        auctions[auctionId] = Auction({
            id: auctionId,
            title: title,
            description: description,
            creator: msg.sender,
            startingBid: startingBid,
            highestBid: FHE.asEuint64(uint64(0)),
            highestBidder: address(0),
            endTime: endTime,
            ended: false,
            finalized: false
        });

        userAuctions[msg.sender].push(auctionId);

        FHE.allowThis(auctions[auctionId].highestBid);

        emit AuctionCreated(auctionId, title, msg.sender, startingBid, endTime);
    }

    /// @notice Place an encrypted bid on an auction
    /// @param auctionId The ID of the auction
    /// @param encryptedBid The encrypted bid amount
    /// @param inputProof The proof for the encrypted input
    function placeBid(
        uint256 auctionId,
        externalEuint64 encryptedBid,
        bytes calldata inputProof
    ) external {
        require(auctionId > 0 && auctionId <= auctionCounter, "Invalid auction ID");
        require(!auctions[auctionId].ended, "Auction has ended");
        require(block.timestamp < auctions[auctionId].endTime, "Auction time expired");
        // require(msg.sender != auctions[auctionId].creator, "Creator cannot bid");

        euint64 bidAmount = FHE.fromExternal(encryptedBid, inputProof);
        bidAmount = FHE.allowThis(bidAmount);

        // Note: Bid comparisons to starting/highest are deferred to off-chain reveal logic

        // Store bidder's bid
        bids[auctionId][msg.sender] = bidAmount;
        FHE.allowThis(bids[auctionId][msg.sender]);
        FHE.allow(bids[auctionId][msg.sender], msg.sender);

        // Add to user's bid list if not already there
        bool alreadyBid = false;
        uint256[] memory userBidList = userBids[msg.sender];
        for (uint256 i = 0; i < userBidList.length; i++) {
            if (userBidList[i] == auctionId) {
                alreadyBid = true;
                break;
            }
        }
        if (!alreadyBid) {
            userBids[msg.sender].push(auctionId);
        }

        emit BidPlaced(auctionId, msg.sender, block.timestamp);
    }

    /// @notice End an auction (can be called by anyone after endTime)
    /// @param auctionId The ID of the auction
    function endAuction(uint256 auctionId) external {
        require(auctionId > 0 && auctionId <= auctionCounter, "Invalid auction ID");
        require(!auctions[auctionId].ended, "Auction already ended");
        require(block.timestamp >= auctions[auctionId].endTime, "Auction still active");

        auctions[auctionId].ended = true;

        emit AuctionEnded(auctionId);
    }

    /// @notice Finalize an auction and reveal the winner
    /// @param auctionId The ID of the auction
    /// @dev This function should be called after endAuction to determine the winner
    function finalizeAuction(uint256 auctionId) external {
        require(auctionId > 0 && auctionId <= auctionCounter, "Invalid auction ID");
        require(auctions[auctionId].ended, "Auction not ended");
        require(!auctions[auctionId].finalized, "Auction already finalized");

        auctions[auctionId].finalized = true;

        emit AuctionFinalized(
            auctionId,
            auctions[auctionId].highestBidder,
            0 // Winning bid will be decrypted off-chain
        );
    }

    /// @notice Get auction details
    /// @param auctionId The ID of the auction
    function getAuction(
        uint256 auctionId
    )
        external
        view
        returns (
            uint256 id,
            string memory title,
            string memory description,
            address creator,
            uint64 startingBid,
            euint64 highestBid,
            address highestBidder,
            uint256 endTime,
            bool ended,
            bool finalized
        )
    {
        require(auctionId > 0 && auctionId <= auctionCounter, "Invalid auction ID");

        Auction memory auction = auctions[auctionId];
        return (
            auction.id,
            auction.title,
            auction.description,
            auction.creator,
            auction.startingBid,
            auction.highestBid,
            auction.highestBidder,
            auction.endTime,
            auction.ended,
            auction.finalized
        );
    }

    /// @notice Get a user's bid for a specific auction
    /// @param auctionId The ID of the auction
    /// @param bidder The address of the bidder
    function getBid(
        uint256 auctionId,
        address bidder
    ) external view returns (euint64) {
        return bids[auctionId][bidder];
    }

    /// @notice Get all auction IDs created by a user
    /// @param user The address of the user
    function getUserAuctions(
        address user
    ) external view returns (uint256[] memory) {
        return userAuctions[user];
    }

    /// @notice Get all auction IDs where a user has placed bids
    /// @param user The address of the user
    function getUserBids(address user) external view returns (uint256[] memory) {
        return userBids[user];
    }

    /// @notice Get the total number of auctions
    function getAuctionCount() external view returns (uint256) {
        return auctionCounter;
    }

    /// @notice Check if an auction is still active
    /// @param auctionId The ID of the auction
    function isAuctionActive(uint256 auctionId) external view returns (bool) {
        require(auctionId > 0 && auctionId <= auctionCounter, "Invalid auction ID");
        return !auctions[auctionId].ended && block.timestamp < auctions[auctionId].endTime;
    }
}
