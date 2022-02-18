import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ethers } from "ethers";
import getEthersProvider from "./utils/getEthers";
import { Container } from "react-bootstrap";
import Home from "./components/Home";

function App() {
    const [state, setState] = useState({
        provider: null,
        signer: null,
        accounts: null,
    });

    const reload = async (firstTime) => {
        let provider;
        if (firstTime) provider = await getEthersProvider();
        else provider = new ethers.providers.Web3Provider(window.ethereum);

        const signer = await provider.getSigner();
        const accounts = await provider.listAccounts();

        setState({
            provider,
            signer,
            accounts,
        });
    };

    useEffect(() => {
        (async () => {
            try {
                window.ethereum.on("accountsChanged", async function (accounts) {
                    await reload(false);
                });

                await reload(true);
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);

    return (
        <BrowserRouter>
            <Container>
                <Routes>
                    <Route exact path="/" element={<Home state={state} />} />
                </Routes>
            </Container>
        </BrowserRouter>
    );
}

export default App;
