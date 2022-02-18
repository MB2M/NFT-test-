/* eslint-disable prettier/prettier */
import React, { useState } from "react";
import { Button, Col, Row, Form, FormControl, Image } from "react-bootstrap";
import { ethers } from "ethers";

function Auction({ state, DSAuction, auctions, selectedAuction, currentImgUrl, currentMetadata }) {
    const [bidAmount, setBidAmount] = useState(0);

    const handleBidAmount = (e) => {
        setBidAmount(e.target.value);
    };

    const handleBid = async () => {
        await DSAuction.signer.bid(selectedAuction, { value: ethers.utils.parseEther(bidAmount.toString()) });
    };

    const handleWithdrawNFT = async () => {
        await DSAuction.signer.withdrawSoldNFT(selectedAuction);
    };

    const started = () => {
        return auctions[selectedAuction].auctionStart.toNumber() < Math.floor(Date.now() / 1000);
    };

    const finished = () => {
        return auctions[selectedAuction].auctionEnd.toNumber() < Math.floor(Date.now() / 1000);
    };

    return (
        <Row className="mt-5">
            <Col sm={5}>
                <h3>{currentMetadata.name}</h3>
                <p>{currentMetadata.description}</p>
                <h6>start: {new Date(auctions[selectedAuction].auctionStart.toNumber() * 1000).toString()}</h6>
                <h6>End: {new Date(auctions[selectedAuction].auctionEnd.toNumber() * 1000).toString()}</h6>
                {!started() && <p>Auction will start soon</p>}
                {finished() && <p>Auction is over</p>}
                {!finished() && started() && (
                    <>
                        Current Bid Amount: {ethers.utils.formatUnits(auctions[selectedAuction].highestBid, 18)}
                        ETH
                        <Form.Group as={Row} className="mb-3" controlId="GRC">
                            <Form.Label column sm="auto">
                                Bid Amount:
                            </Form.Label>
                            <Col>
                                <FormControl
                                    name="_tokenId"
                                    type="text"
                                    placeholder="XX ETH"
                                    onChange={handleBidAmount}
                                />
                            </Col>
                        </Form.Group>
                        <Button variant="primary" size="sm" className="mx-1" onClick={handleBid}>
                            Bid
                        </Button>
                    </>
                )}
                {finished() &&
                    !auctions[selectedAuction].ended &&
                    auctions[selectedAuction].winner == state.accounts[0] && (
                    <Button variant="primary" size="sm" className="mx-1" onClick={handleWithdrawNFT}>
                        withdrawNFT
                    </Button>
                )}
            </Col>
            <Col sm={3}>
                <Image src={currentImgUrl} fluid />
            </Col>
        </Row>
    );
}

export default Auction;
