/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useLayoutEffect } from "react";
import { Button, Col, Modal, Row, Form, FormControl, Card, Image, Badge } from "react-bootstrap";
import { ethers } from "ethers";
import DSAuctionArtifact from "../artifacts/contracts/DSAuction.sol/DSAuction.json";
import OwnerForm from "./OwnerForm";
import WalletStatus from "./WalletStatus";
import Auction from "./Auction";

const contractAddresses = require("../contractAddresses.json");
const DSAuctionContractAddress = contractAddresses.DSAuction;

function Home({ state }) {
    const [selectedAuction, setSelectedAuction] = useState(-1);
    const [auctions, setAuctions] = useState([]);
    const [DSAuction, setDSAuction] = useState({});
    const [owner, setOwner] = useState("");
    const [currentImgUrl, setCurrentImgUrl] = useState("");
    const [currentMetadata, setCurrentMetadata] = useState({});

    const [pendings, setPendings] = useState(0);

    useEffect(() => {
        (async () => {
            if (state.provider) {
                const provider = new ethers.Contract(DSAuctionContractAddress, DSAuctionArtifact.abi, state.provider);
                const signer = new ethers.Contract(DSAuctionContractAddress, DSAuctionArtifact.abi, state.signer);

                setDSAuction({
                    provider: provider,
                    signer: signer,
                });

                const auctions = await signer.getAuctions();
                setAuctions(auctions);
            }
        })();
    }, [state]);

    useEffect(() => {
        if (DSAuction.signer) {
            (async () => {
                const owner = await DSAuction.signer.owner();
                setOwner(owner);
                const pendings = await DSAuction.signer.pendingReturns(state.accounts[0]);
                setPendings(pendings);
            })();
        }
    }, [DSAuction]);

    useLayoutEffect(() => {
        (async () => {
            if (auctions[selectedAuction] && DSAuction.signer) {
                console.log(auctions[selectedAuction].tokenId.toNumber());
                let tokenUri = await DSAuction.signer.tokenUris(auctions[selectedAuction].tokenId.toNumber());
                console.log(tokenUri);
                const baseUri = "https://ipfs.io/ipfs/";
                tokenUri = tokenUri.replace("ipfs://", baseUri);
                const response = await fetch(tokenUri);
                const json = await response.json();
                setCurrentImgUrl(json.image.replace("ipfs://", baseUri));
                setCurrentMetadata(json);
            }
        })();
    }, [selectedAuction, DSAuction]);

    console.log(currentImgUrl);

    const handleWithdrawPendings = async () => {
        await DSAuction.signer.withdrawPendings();
    };

    return (
        <div className="Home">
            <Row>
                <Col sm={9}>
                    <h2>Welcome to the DSNFT auction!</h2>
                    {pendings > 0 && (
                        <Button variant="primary" size="sm" className="mx-1" onClick={handleWithdrawPendings}>
                            withdraw Pendings
                        </Button>
                    )}
                </Col>
                <Col sm={3}>
                    <WalletStatus state={state} />
                </Col>
            </Row>
            {state.accounts && state.accounts[0] === owner && <OwnerForm DSAuction={DSAuction} />}
            <Row>
                <Col sm={12}>Select auction:</Col>
                <Col>
                    {auctions.map(
                        (a, i) =>
                            (
                                <Button
                                    key={i}
                                    onClick={() => setSelectedAuction(i)}
                                    variant={i === selectedAuction ? "success" : "primary"}
                                >
                                    {`Auction ${a.tokenId.toNumber()}`}
                                </Button>
                            )
                    )}
                </Col>
            </Row>
            {auctions[selectedAuction] && (
                <Auction
                    state={state}
                    DSAuction={DSAuction}
                    auctions={auctions}
                    selectedAuction={selectedAuction}
                    currentImgUrl={currentImgUrl}
                    currentMetadata={currentMetadata}
                />
            )}
        </div>
    );
}

export default Home;
