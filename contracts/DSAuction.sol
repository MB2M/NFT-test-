//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";

interface IDSNFT {
    function safeMint(address _to, string memory _tokenURI) external;

    function exists(uint256 tokenId) external view returns (bool);
}

/*
 * An auction contract to sell NFT.
 * Lazy Minting (winnner of the auction will mint the NFT)
 */
contract DSAuction is Ownable, ERC721Holder {
    struct Auction {
        address winner;
        address nftContract;
        uint256 tokenId;
        uint256 highestBid;
        uint256 auctionStart;
        uint256 auctionEnd;
        bool ended;
    }

    constructor(string[] memory _uris) {
        for (uint256 i = 0; i < _uris.length; i++) {
            tokenUris[i + 1] = _uris[i];
        }
    }

    mapping(uint256 => string) public tokenUris;

    mapping(address => uint256) public pendingReturns;

    uint256 private recipientsCount;
    address[] private recipients;

    Auction[] public auctions;

    event NewAuction(uint256 tokenId, address nftContract);
    event HighestBidIncreased(address winner, uint256 newHigh);

    // Retrieve all the auctions
    function getAuctions() external view returns (Auction[] memory) {
        return auctions;
    }

    /**
     *  @notice Remove a recipient as receiver of the NFT sell
     *  @param _recipient Address of the recipient to add
     */
    function addRecipient(address _recipient) external onlyOwner {
        recipients.push(_recipient);
        recipientsCount++;
    }

    /**
     *  @notice Remove a recipient as receiver of the NFT sell
     *  @param _recipient Address of the recipient to remove
     */
    function removeRecipient(address _recipient) external onlyOwner {
        for (uint256 i; i < recipients.length; i++) {
            if (recipients[i] == _recipient) {
                delete recipients[i];
                recipientsCount--;
            }
        }
    }

    /**
     *  @notice Return all recipients
     */
    function getRecipients()
        external
        view
        onlyOwner
        returns (address[] memory)
    {
        return recipients;
    }

    /**
     * @notice create a new auction
     * @param _start Unix format date representing the start of the auction
     *               Should be after the actual block.timestamp
     * @param _duration Duration of the auction in minutes
     * @param _minimumPrice The Minimum Price to start the auction
     *                       First bid should be over this price
     * @param _tokenId Id of the Nft to be created
     * @param _nftContract Address of the NFT contract
     */
    function newAuction(
        uint256 _start,
        uint256 _duration,
        uint256 _minimumPrice,
        uint256 _tokenId,
        address _nftContract
    ) external onlyOwner {
        require(!IDSNFT(_nftContract).exists(_tokenId), "already minted");
        require(_start > block.timestamp, "start time should be in future");
        require(_duration > 0, "duration has to be more than 0");

        Auction storage auction = auctions.push();
        auction.auctionStart = _start;
        auction.auctionEnd = _start + _duration * 60;
        auction.highestBid = _minimumPrice;
        auction.nftContract = _nftContract;
        auction.tokenId = _tokenId;

        emit NewAuction(_tokenId, _nftContract);
    }

    /**
     *  @notice Bid for a specific auction
     *          Value send should be over the highest bid
     *          Only available if auction is started and not ended
     *  @param _auctionId id of the auction
     */
    function bid(uint256 _auctionId) external payable {
        Auction storage auction = auctions[_auctionId];
        require(msg.value > auction.highestBid, "value under last bid");
        require(block.timestamp > auction.auctionStart, "not started");
        require(block.timestamp < auction.auctionEnd, "auction ended");
        pendingReturns[auction.winner] += auction.highestBid;
        auction.winner = msg.sender;
        auction.highestBid = msg.value;

        emit HighestBidIncreased(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw Pendings ETH
     */
    function withdrawPendings() external {
        uint256 amount = pendingReturns[msg.sender];
        require(amount > 0, "nothing to withdraw");
        pendingReturns[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    /**
     * @notice Winner of the auction mint his NFT
     * @param _auctionId Id of the auction
     */
    function withdrawSoldNFT(uint256 _auctionId) external {
        require(msg.sender == auctions[_auctionId].winner, "not price winner");
        _withdrawNFT(_auctionId);
    }

    /**
     * @notice Owner can mint the NFT
     * @param _auctionId Id of the auction
     */
    function withdrawUnsoldNFT(uint256 _auctionId) external onlyOwner {
        require(
            address(0) == auctions[_auctionId].winner,
            "auction has a winner"
        );
        _withdrawNFT(_auctionId);
    }

    /**
     * @notice Owner can mint the NFT
     * @param _auctionId Id of the auction
     * @dev Internal function
     */
    function _withdrawNFT(uint256 _auctionId) internal {
        Auction storage auction = auctions[_auctionId];
        require(!auction.ended, "auction ended");
        require(auction.auctionEnd < block.timestamp, "biding not ended");

        auction.ended = true;

        IDSNFT(auction.nftContract).safeMint(
            msg.sender,
            tokenUris[auction.tokenId]
        );

        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] != address(0)) {
                payable(recipients[i]).transfer(
                    auction.highestBid / recipientsCount
                );
            }
        }
    }
}
