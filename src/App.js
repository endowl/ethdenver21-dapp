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
import {Button, Collapse, Form} from "react-bootstrap";
import LetterToTrustedPerson from "./components/LetterToTrustedPerson";
import {set} from "lodash"
import OpolisDataModal from "./components/OpolisDataModal";
import aliceOpolisData from "./templates/example-data.json"
import Upload from "./components/Upload";

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
                <h1>
                    <Link to="/">Team Alfred Demo</Link>
                    <table style={{margin: "0 auto"}}>
                        <tr>
                            <td>
                        <Link to="/owlfred">
                            <img src={owlfred} style={{height: "50px", width: "auto"}} />
                        </Link>
                            </td>
                            <td>
                        <Link to="/alice">
                            <img src={owlalice} style={{height: "50px", width: "auto"}} />
                        </Link>
                            </td>
                            <td>
                        <Link to="/bob">
                            <img src={owlbob} style={{height: "50px", width: "auto"}} />
                        </Link>
                            </td>
                        </tr>
                    </table>
                </h1>

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
                    <Route path="/letter-to-trusted-person">
                        <LetterToTrustedPerson />
                    </Route>
                    <Route path="/">
                        <Home />
                    </Route>
                </Switch>
            </div>
        </Router>
    );
}

let deadSetter;
let props ={};

function Owlfred() {
    return (
        <header className="App-header">
            <h1>Owlfred the Oracle</h1>
            <img src={owlfred} className="App-logo" alt="logo" style={{maxWidth:"200px", height:"auto"}} />
            <p>
                Submit death certificate.<br />
                <Upload deadSetter={deadSetter}/>
            </p>
        </header>
    )
}

function Alice() {
    const [show, setShow] = useState(false);
    const [identity, setIdentity] = useState(null)
    const [buckets, setBuckets] = useState(null);
    const [bucketKey, setBucketKey] = useState(null);

    const [aliceBucketMockup, setAliceBucketMockup] = useState(0);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const aliceMockup1 = () => {
        setAliceBucketMockup(1);
    }
    const aliceMockup2 = () => {
        setAliceBucketMockup(2);
    }
    const aliceMockup3 = () => {
        setAliceBucketMockup(3);
    }
    const aliceMockup4 = () => {
        setAliceBucketMockup(4);
    }

    const [docProps, setDocProps] = useState(Object.assign({}, aliceOpolisData))
    deadSetter = () => setDocProps(set(docProps, "member.isDeceased", true))
    props = docProps

    useEffect(() => {
        async function doAsyncStuff() {
            // localStorage.clear(); // TODO: Remove this after debugging
            let id = getIdentity("alice");
            setIdentity(id);
            // NOTE: identity is still null at this point but get's updated asynchronously?
            console.log("identity", identity);
            console.log("id", id);
            console.log("public key", id.public.toString());

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
                console.log(value)
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

    const setState = path => ({target: {value}}) => {
        const newDocProps = set({...docProps}, path, value)
        setDocProps(newDocProps)
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
                    Save Alice's encrypted documents to Textile bucket.
                </p>
                <Button onClick={aliceMockup1}>
                    Store on Textile
                </Button>

                <p>
                    {/*Encrypt living document for Bob.*/}
                    Share living document with Bob.
                </p>
                <Button onClick={aliceMockup2}>
                    Share with Bob
                </Button>

                <p>
                    Save proxy re-encryption keys with Owlfred.
                </p>
                <Button onClick={aliceMockup3}>
                    Save proxy key
                </Button>
                <Collapse in={aliceBucketMockup >=3}>
                    <h5><i>Proxy re-encryption keys saved with Owlfred</i></h5>
                </Collapse>

                <p>
                    Re-encrypt post-mortem document for Bob when appropriate.
                </p>
                <Button onClick={aliceMockup4}>
                    Re-encrypt for Bob
                </Button>

                <br/>

                <div className="container">
                    <div className="row">
                        <div className="col col-md-6">
                            <div style={{backgroundColor: "white", color: "#282c34", borderRadius: "25px"}}>
                                Alice's Textile Bucket:<br />
                                <Collapse in={aliceBucketMockup >= 1}>
                                    <ul>
                                        <li id="doc_living">Opolis Policy, Living Data</li>
                                        <li id="doc_dead">Opolis Policy, Post Mortem Data</li>
                                    </ul>
                                </Collapse>
                            </div>
                        </div>
                        <div className="col col-md-6">
                            <div style={{backgroundColor: "white", color: "#282c34", borderRadius: "25px"}}>
                                Bob's Textile Bucket:<br />
                                <Collapse in={aliceBucketMockup >= 2}>
                                    <ul>
                                        <li id="doc_living">Alice's Policy, Living Data</li>
                                    </ul>
                                </Collapse>
                                <Collapse in={aliceBucketMockup >= 4}>
                                    <ul>
                                        <li id="doc_living">Alice's Policy, Post Mortem Data</li>
                                    </ul>
                                </Collapse>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <OpolisDataModal
                show={show}
                showForm={true}
                handleClose={handleClose}
                docProps={docProps}
                setState={setState}
            />
        </>
    )
}

function Bob() {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // TODO: Demo REDACTED data while Alice is still alive
    // TODO: Pull this data from Textile bucket and decrypt it
    // const [docProps, setDocProps] = useState(docProps);

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
            <OpolisDataModal
                show={show}
                showForm={false}
                handleClose={handleClose}
                docProps={props}
            />
        </>
    )
}

function Home() {
    return (
        <header className="App-header">
            <Link to="/owlfred">
                <img src={owlfred} style={{height: "50px", width: "auto"}} /> Owlfred
            </Link>
            <Link to="/alice">
                <img src={owlalice} style={{height: "50px", width: "auto"}} /> Alice
            </Link>
            <Link to="/bob">
                <img src={owlbob} style={{height: "50px", width: "auto"}} /> Bob
            </Link>
        </header>
    )
}

export default App;
