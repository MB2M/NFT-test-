const { expect } = require("chai");
const { ethers } = require("hardhat");

let owner, addr1;
let dsAuction, dsnft;

const MINTER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("MINTER_ROLE")
);

const metaUris = ["link1", "link2", "link3"];

describe("DSAuction", function () {
  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();
    const DSAuction = await ethers.getContractFactory("DSAuction");
    dsAuction = await DSAuction.deploy(metaUris);
    await dsAuction.deployed();
    const DSNFT = await ethers.getContractFactory("DSNFT");
    dsnft = await DSNFT.deploy();
    await dsnft.deployed();

    // Grant role Minter to auction contract
    await dsnft.grantRole(MINTER_ROLE, dsAuction.address);

    // add 2 recipient of sales
    // await dsAuction.addRecipient(owner.address);
    // await dsAuction.addRecipient(addr1.address);
  });

  it("Should add a recipient", async function () {
    await dsAuction.connect(owner).addRecipient(owner.address);
    expect((await dsAuction.getRecipients())[0]).to.equal(owner.address);
  });

  it("Should should remove recipient", async () => {
    await dsAuction.connect(owner).addRecipient(owner.address);
    expect((await dsAuction.getRecipients())[0]).to.equal(owner.address);
    await dsAuction.connect(owner).removeRecipient(owner.address);
    expect((await dsAuction.getRecipients())[0]).to.equal(
      ethers.constants.AddressZero
    );
  });

  it("Should create a new auction", async function () {
    expect((await dsAuction.getAuctions()).length).to.equal(0);
    await dsAuction
      .connect(owner)
      .newAuction(
        Math.floor(Date.now() / 1000) + 20,
        1,
        1000,
        1,
        dsnft.address
      );
    expect((await dsAuction.getAuctions()).length).to.equal(1);
  });

  context("with new auction", () => {
    beforeEach(async () => {
      await dsAuction
        .connect(owner)
        .newAuction(
          Math.floor(Date.now() / 1000) + 30,
          1,
          1000,
          1,
          dsnft.address
        );
    });

    it("should bid for an auction", async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 32000);
      });
      await dsAuction.connect(addr1).bid(0, { value: 2000 });
      const auctions = await dsAuction.getAuctions();
      expect(auctions[0].highestBid).to.equal(2000);
    });

    it("should revert due to bid lower than highestBid", async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 32000);
      });
      await dsAuction.connect(addr1).bid(0, { value: 2000 });
      const auctions = await dsAuction.getAuctions();
      expect(auctions[0].highestBid).to.equal(2000);
      await expect(
        dsAuction.connect(owner).bid(0, { value: 1900 })
      ).to.be.revertedWith("value under last bid");
    });

    it("should revert due to auction not started", async () => {
      await expect(
        dsAuction.connect(owner).bid(0, { value: 1900 })
      ).to.be.revertedWith("not started");
    });
    // it("should withdraw pendings", async () => {
    //   await new Promise((resolve) => {
    //     setTimeout(resolve, 32000);
    //   });
    //   await dsAuction.connect(addr1).bid(0, { value: 2000 });
    //   await dsAuction.connect(owner).bid(0, { value: 2200 });
    //   const beforeAccount = await ethers.provider.getBalance(addr1.address);
    //   await dsAuction.connect(addr1).withdrawPendings();
    //   expect(await ethers.provider.getBalance(addr1.address)).to.equal(
    //     beforeAccount + 2000
    //   );
    // });
  });
});
