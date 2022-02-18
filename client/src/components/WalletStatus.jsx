import React from "react";
import { Badge } from "react-bootstrap";

function WalletStatus({ state }) {
    return (
        <div className="walletInfo">
            <span className="walletInfoLabel">
                {window.ethereum !== "undefined" && state.accounts ? (
                    <Badge bg="success">
                        {state.accounts[0].substring(0, 5) + "..." + state.accounts[0].slice(-4)}
                    </Badge>
                ) : (
                    <Badge bg="dark">Wallet not connected</Badge>
                )}
            </span>
        </div>
    );
}

export default WalletStatus;
