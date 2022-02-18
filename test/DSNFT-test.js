const { expect } = require("chai");
const { ethers } = require("hardhat");

let owner, addr1;
let dsnft;

const MINTER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("MINTER_ROLE")
);

const nft0 = {
  tokenURI: "mon token URI",
  metadata: {
    name: "DSNFT #1",
    image: "mon addresse IPFS",
    attributes: [
      {
        trait_type: "Power",
        value: Math.floor(Math.random() * 10 + 1),
      },
      {
        trait_type: "Level",
        value: 1,
        max_value: 10,
      },
    ],
    description: "This is a test NFT series",
  },
};

describe("DSNFT", function () {
  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();
    const DSNFT = await ethers.getContractFactory("DSNFT");
    dsnft = await DSNFT.deploy();
    await dsnft.deployed();
  });

  it("Should mint a new NFT nft0", async function () {
    await dsnft.connect(owner).safeMint(owner.address, nft0.tokenURI);
    expect(await dsnft.tokenCount()).to.equal(1);
    expect(await dsnft.tokenURI(1)).to.equal("mon token URI");
  });

  it("Should should revert", async () => {
    await expect(
      dsnft.connect(addr1).safeMint(owner.address, nft0.tokenURI)
    ).to.be.revertedWith(
      `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${MINTER_ROLE}`
    );
  });

  it("Should mint 10 NFT and revert", async function () {
    for (let i = 0; i < 10; i++) {
      await dsnft.connect(owner).safeMint(owner.address, nft0.tokenURI);
      const tokenCount = await dsnft.tokenCount();
      expect(await dsnft.tokenURI(tokenCount)).to.equal("mon token URI");
    }
    await expect(
      dsnft.connect(owner).safeMint(owner.address, nft0.tokenURI)
    ).to.be.revertedWith("Max supply already reached");
  });

  it("should return true (token exist)", async () => {
    expect(await dsnft.exists(1)).to.be.equal(false);
    await dsnft.connect(owner).safeMint(owner.address, nft0.tokenURI);
    expect(await dsnft.exists(1)).to.be.equal(true);
  });
});
