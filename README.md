## <u>Presentation</u>

This is a test NFT project

/!\ DON'T USE IT IN PRODUCTION /!\

It's developped with Hardhat, ethersjs and Reactjs

## 1.Install

Clone this repository.

Open your favorite terminal at the root folder and execute :<br />

    $ npm install && npx hardhat compile && cd client && npm install`

## 2.Configuration

Create your own `.env` file and add your parameters (there is a .env.example file that you can copy):

    -   `MNEMONIC`: Your mnemonic.
    -   `RINKEBY_URL`
    -   `PINATA_API_KEY`
    -   `PINATA_API_SECRET`

## 3. Deployment

We use Hardhat to deploy the smart contracts.

**On local Hardhat network:<br />**

    $ npx hardhat node
    $ npx hardhat run scripts/deploy_without_mint.js

**On Rinkeby Testnet :<br />**

    $ npx hardhat node
    $ npx hardhat run scripts/deploy_without_mint.js --network rinkeby

## 4. Start client

Once contracts are deployed, you can start the client :<br/>

    $ cd client; npm start

## 5. Docs
Repository:

`client`: Front End client (ReactJs)

`contracts`: contains the solidity contracts that will be deployed

`meta`: images used for this test.
You will find their IPFS url in `ipfs_url.json`

`scripts`: contains the deploy script

`test`: contains the tests