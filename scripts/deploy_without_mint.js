// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
require("dotenv").config();

const pinataSDK = require("@pinata/sdk");
const pinata = pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_API_SECRET
);

const imgUrl = require("../meta/ipfs_url.json");

const metadata = {
  name: "DSNFT #1",
  image: "addresse IPFS",
  attributes: [
    {
      trait_type: "Power",
      value: 0,
    },
    {
      trait_type: "Level",
      value: 1,
      max_value: 10,
    },
  ],
  description: "This is a test NFT series",
};

const uriList = [];

async function main() {
  for (let i = 0; i < 10; i++) {
    const meta = metadata;
    meta.name = `DSNFT #${i + 1}`;
    meta.image = imgUrl[i + 1];
    meta.attributes[0].value = Math.floor(Math.random() * 10 + 1);
    meta.attributes[1].value = Math.floor(Math.random() * 20 + 1);
    meta.attributes[1].max_value = 20;

    await pinata
      .pinJSONToIPFS(meta)
      .then(async (result) => {
        console.log(result);
        uriList.push(`ipfs://${result.IpfsHash.toString()}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy

  const [owner, addr1] = await hre.ethers.getSigners();

  const DSNFT = await hre.ethers.getContractFactory("DSNFT");
  const dsnft = await DSNFT.deploy();

  await dsnft.deployed();

  console.log("DSNFT deployed to:", dsnft.address);

  const Auction = await hre.ethers.getContractFactory("DSAuction");
  const auction = await Auction.deploy(uriList);

  await auction.deployed();

  console.log("Auction deployed to:", auction.address);

  // Grant role Minter to auction contract
  await dsnft.grantRole(dsnft.MINTER_ROLE(), auction.address);

  // add 2 recipient of sales
  await auction.addRecipient(owner.address);
  await auction.addRecipient(addr1.address);

  const contractAddresses = {
    DSAuction: auction.address,
    DSNFT: dsnft.address,
  };

  // Store contracts addresses for client
  storeContractAddresses(contractAddresses);

  console.log("deploy ended");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const storeContractAddresses = (jsonData) => {
  const fs = require("fs");

  fs.writeFileSync(
    "./client/src/contractAddresses.json",
    JSON.stringify(jsonData),
    function (err) {
      if (err) {
        console.log(err);
      }
    }
  );
};
