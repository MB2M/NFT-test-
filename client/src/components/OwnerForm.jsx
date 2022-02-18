import React, { useEffect, useState, useLayoutEffect } from "react";
import { Button, Col, Modal, Row, Form, FormControl, Card, Image } from "react-bootstrap";
import { ethers } from "ethers";

import contractAddresses from "../contractAddresses.json";

const DSNFTContractAddress = contractAddresses.DSNFT;

function OwnerForm({ DSAuction }) {
    const [formData, setFormData] = useState({});

    const handleOwnerFormChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const addAuction = async () => {
        const data = { ...formData, _nftContract: DSNFTContractAddress };
        const tx = await DSAuction.signer.newAuction(
            data._start,
            data._duration,
            ethers.utils.parseEther(data._minimumPrice.toString()),
            data._tokenId,
            data._nftContract
        );
        await tx;
    };

    return (
        <Row>
            <Col>
                <h3>Add new auctions</h3>
                <Form.Group as={Row} className="mb-3" controlId="GRC">
                    <Form.Label column sm="auto">
                        start:
                    </Form.Label>
                    <Col sm={2}>
                        <FormControl name="_start" type="text" placeholder="00" onChange={handleOwnerFormChange} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="GRC">
                    <Form.Label column sm="auto">
                        duration:
                    </Form.Label>
                    <Col sm={2}>
                        <FormControl name="_duration" type="text" placeholder="00" onChange={handleOwnerFormChange} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="GRC">
                    <Form.Label column sm="auto">
                        minimum price:
                    </Form.Label>
                    <Col sm={2}>
                        <FormControl
                            name="_minimumPrice"
                            type="text"
                            placeholder="00"
                            onChange={handleOwnerFormChange}
                        />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="GRC">
                    <Form.Label column sm="auto">
                        token id:
                    </Form.Label>
                    <Col sm={2}>
                        <FormControl name="_tokenId" type="text" placeholder="00" onChange={handleOwnerFormChange} />
                    </Col>
                </Form.Group>
                <Button variant="primary" size="sm" className="mx-1" onClick={addAuction}>
                    + Add
                </Button>
            </Col>
            <hr />
        </Row>
    );
}

export default OwnerForm;
