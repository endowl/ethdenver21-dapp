import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';
// import logo from './endowl-logo.png';
import owlfred from './owlfred/alfred.svg';
import owlalice from './owlalice/alfred.svg';
import owlbob from './owlbob/alfred.svg';
import './App.css';
import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";
// import hub from '@textile/hub'
import {Buckets, Client, PrivateKey} from '@textile/hub';
import {useEffect, useState} from "react";
import {Button, Form} from "react-bootstrap";

const keyInfo = {
  key: 'bscp24bwolbgs7ciwbxkgsoh6a4',  // 'INSECURE API KEY',
}
const keyInfoOptions = {
    debug: false
}

// TODO: NOT THIS!!!
// const ALICE_PRIVATE = "bbaareqgk3j7dtk733p7qt5zwf6i34ghu2adghr36v6j6w2pkhgdszazhb55e3gd5wvxohmvj5ctgzfontxeowzedixqhfje4776he5tfkfc5u";
// const ALICE_KEY = "bbaareid2jwmh3nlo4ozkt2fgnsk43hoi5nsigrpaoksjz774oj3gkukf3i"

async function authorize (key, identity) {
  const client = await Client.withKeyInfo(key)
  await client.getToken(identity)
  return client
}

function App() {
    return (
        <Router>
            <div className="App">
                <h1><Link to="/">Team Alfred Demo</Link></h1>

                <Switch>
                    <Route path="/owlfred">
                        <Owlfred />
                    </Route>
                    <Route path="/alice">
                        <Alice />
                    </Route>
                    <Route path="/bob">
                        <Bob />
                    </Route>
                    <Route path="/">
                        <Home />
                    </Route>
                </Switch>
            </div>
        </Router>
    );
}

function Owlfred() {
    return (
        <header className="App-header">
            <h1>Owlfred the Oracle</h1>
            <img src={owlfred} className="App-logo" alt="logo" style={{maxWidth:"200px", height:"auto"}} />
            <p>
                Submit death certificate.<br />
                <input type="file" />
                <input type="button" value="Sign &amp; Submit" />
            </p>
        </header>
    )
}

function Alice() {
    const [show, setShow] = useState(false);
    const [identity, setIdentity] = useState(null)
    const [buckets, setBuckets] = useState(null);
    const [bucketKey, setBucketKey] = useState(null);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [docProps, setDocProps] = useState({
        full_name: 'Alice Finnegan',
        policy: 420523000111,
        life_insurance_coverage: "$10,000,000",
    });

    useEffect(() => {
        async function doAsyncStuff() {
            // localStorage.clear(); // TODO: Remove this after debugging
            let id = getIdentity("alice");
            setIdentity(id);
            // NOTE: identity is still null at this point but get's updated asynchronously?
            console.log("identity", identity);
            console.log("id", id);

            // getBucketKey
            if (!id) {
                throw new Error('Identity not set')
            }
            const buckets = await Buckets.withKeyInfo(keyInfo, keyInfoOptions)
            // Authorize the user and your insecure keys with getToken
            await buckets.getToken(id)

            // const buck = await buckets.getOrCreate('io.textile.dropzone')
            const buck = await buckets.getOrCreate('com.endowl.dropzone')
            if (!buck.root) {
                throw new Error('Failed to open bucket')
            }
            console.log("buckets", buckets);
            console.log("bucketKey", buck.root.key);
            setBuckets(buckets);
            setBucketKey(buck.root.key);
            // return {buckets: buckets, bucketKey: buck.root.key};

            if(!buckets || !buck.root.key) {
                console.error("No bucket client or root key");
                return;
            }
            try {
                // TODO: Set path to the name of a file expected to be in Alice's bucket

                let path = 'index.json';
                const metadata = buckets.pullPath(buck.root.key, path)
                const { value } = await metadata.next();
                let str = "";
                for (var i = 0; i < value.length; i++) {
                    str += String.fromCharCode(parseInt(value[i]));
                }
                const index = JSON.parse(str)
                console.log("index", index);
                // return index
            } catch (error) {
                console.log("Error loading file from bucket")
            //     const index = await initIndex()
            //     await initPublicGallery()
            //     return index
            }
        }

        doAsyncStuff();
    }, [])

    /**
     * getIdentity uses a basic private key identity.
     * The user's identity will be cached client side. This is long
     * but ephemeral storage not sufficient for production apps.
     *
     * Read more here:
     * https://docs.textile.io/tutorials/hub/libp2p-identities/
     */
    // async function getIdentity(who) {
    function getIdentity(who) {
        const storageKey = "identity_" + who;
        try {
            var storedIdent = localStorage.getItem(storageKey);
            if (storedIdent === null) {
                throw new Error('No identity')
            }
            const restored = PrivateKey.fromString(storedIdent)
            return restored
        }
        catch (e) {
            /**
             * If any error, create a new identity.
             */
            try {
                const identity = PrivateKey.fromRandom()
                const identityString = identity.toString()
                localStorage.setItem(storageKey, identityString)
                return identity
            } catch (err) {
                return err.message
            }
        }
    }


    return (
        <>
            <header className="App-header">
                <h1>Alice's Secure Shared Documents</h1>

                <img src={owlalice} className="App-logo" alt="logo" style={{maxWidth:"200px", height:"auto"}} />

                <p>
                    Create document from template:
                </p>
                <Button variant="primary" onClick={handleShow}>
                    Opolis Policy Details
                </Button>

                <p>
                    Save Alice's encrypted document to Textile bucket
                </p>

                <p>
                    Re-encrypt living document for Bob:
                </p>

                <p>
                    Re-encrypt post-mortem document for Bob:
                </p>

                <p>
                    Save re-encryption keys with Alfred:
                </p>

                {/*<img src={logo} className="App-logo" alt="logo" style={{maxWidth:"200px", height:"auto"}} />*/}
                {/*<img src={logo} className="App-logo" alt="logo" />*/}
            </header>
            <Modal show={show} onHide={handleClose} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Opolis Policy Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Your <strong>Opolis Policy Details</strong> document has been pre-populated using your <strong>Opolis account</strong>.<br/>
                    <Form>
                        <Form.Group>
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control value={docProps.full_name} onChange={event => setDocProps({...docProps, full_name: event.target.value})} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Policy #</Form.Label>
                            <Form.Control value={docProps.policy} onChange={event => setDocProps({...docProps, policy: event.target.value})} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Life insurance coverage</Form.Label>
                            <Form.Control value={docProps.life_insurance_coverage} onChange={event => setDocProps({...docProps, life_insurance_coverage: event.target.value})} />
                        </Form.Group>
                    </Form>
                    <code>
                        <strong>{docProps.full_name}</strong> is a customer of Opolis with policy # <strong>{docProps.policy}</strong>.<br />
                        Life insurance coverage is held in the amount of <strong>{docProps.life_insurance_coverage}</strong>.<br />
                        {/*Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.*/}
                    </code>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleClose}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

function Bob() {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // TODO: Demo REDACTED data while Alice is still alive
    // TODO: Pull this data from Textile bucket and decrypt it
    const [docProps, setDocProps] = useState({
        full_name: 'Alice Finnegan',
        policy: 420523000111,
        life_insurance_coverage: "$10,000,000",
    });

    return (
        <>
            <header className="App-header">
                <h1>Bob the Beneficiary</h1>

                <img src={owlbob} className="App-logo" alt="logo" style={{maxWidth:"200px", height:"auto"}} />

                <p>
                    Open Alice's document encrypted for Bob from Textile bucket
                </p>
                <Button variant="primary" onClick={handleShow}>
                    Opolis Policy Details
                </Button>

                <p>
                    Request Alfred deliver Alice's post-mortem document encrypted for Bob:
                </p>

                <p>
                    Open Alice's post-mortem document encrypted for Bob:
                </p>
            </header>
            <Modal show={show} onHide={handleClose} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Opolis Policy Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <code>
                        <strong>{docProps.full_name}</strong> is a customer of Opolis with policy # <strong>{docProps.policy}</strong>.<br />
                        Life insurance coverage is held in the amount of <strong>{docProps.life_insurance_coverage}</strong>.<br />
                        {/*Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.*/}
                    </code>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleClose}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

function Home() {
    return (
        <header className="App-header">
            <Link to="/owlfred">Owlfred</Link>
            <Link to="/alice">Alice</Link>
            <Link to="/bob">Bob</Link>
        </header>
    )
}

export default App;
