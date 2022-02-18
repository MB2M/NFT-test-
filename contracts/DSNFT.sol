//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract DSNFT is ERC721URIStorage, Ownable, AccessControl {
    using Counters for Counters.Counter;

    Counters.Counter public tokenCount;
    uint8 public MAX_SUPPLY = 10;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() ERC721("DSNFT", "DS") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl, ERC721)
        returns (bool)
    {
        return
            ERC721.supportsInterface(interfaceId) ||
            AccessControl.supportsInterface(interfaceId);
    }

    /**
     * @notice MINT a specific NFT and send it to a specific address
     * @param _to Receiver of the NFT
     * @param _tokenURI Url of the token's metadata
     * @dev Can only be minted by an address which has the MINTER_ROLE
     *      As owner, use grandRole() function AccessControl to grant a Role
     */
    function safeMint(address _to, string memory _tokenURI)
        external
        onlyRole(MINTER_ROLE)
    {
        require(tokenCount._value < MAX_SUPPLY, "Max supply already reached");
        uint256 tokenID = tokenCount._value + 1;
        _safeMint(_to, tokenID);
        _setTokenURI(tokenID, _tokenURI);
        tokenCount.increment();
    }

    /**
     * @notice Check if a token is already minted
     */
    function exists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }
}
