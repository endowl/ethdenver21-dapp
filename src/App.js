import 'bootstrap/dist/css/bootstrap.min.css';
// import logo from './endowl-logo.png';
import owlfred from './owlfred/alfred.svg';
import owlalice from './owlalice/alfred.svg';
import owlbob from './owlbob/alfred.svg';
import './App.css';
import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";
// import {Buckets, Client, PrivateKey} from '@textile/hub';
// import { BigNumber, providers, utils } from 'ethers'
// import { hashSync } from 'bcryptjs'
import {useEffect, useState} from "react";
import {Button, Collapse} from "react-bootstrap";
import LetterToTrustedPerson from "./components/LetterToTrustedPerson";
import {set} from "lodash"
import OpolisDataModal from "./components/OpolisDataModal";
import aliceOpolisData from "./templates/example-data.json"
import Upload from "./components/Upload";
import StorageMechanism from "./StorageMechanism";


function App() {
    return (
        <Router>
            <div className="App">
                <h1>
                    <Link to="/">Team Alfred Demo</Link>
                    <table style={{margin: "0 auto"}}>
                        <tbody>
                            <tr>
                                <td>
                            <Link to="/owlfred">
                                <img src={owlfred} alt="Owlfred" style={{height: "50px", width: "auto"}} />
                            </Link>
                                </td>
                                <td>
                            <Link to="/alice">
                                <img src={owlalice} alt="Alice" style={{height: "50px", width: "auto"}} />
                            </Link>
                                </td>
                                <td>
                            <Link to="/bob">
                                <img src={owlbob} alt="Bob" style={{height: "50px", width: "auto"}} />
                            </Link>
                                </td>
                            </tr>
                        </tbody>
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
    const [storage, setStorage] = useState(new StorageMechanism());
    const [show, setShow] = useState(false);
    // const [identity, setIdentity] = useState(null)
    const who = "alice";
    // TODO: getSavedIdentity(...) seems to get called more than once, address that (see "textile identity loaded" in console logs)
    const [identity, setIdentity] = useState(storage.getSavedIdentity(who))
    const [buckets, setBuckets] = useState(null);
    const [bucketKey, setBucketKey] = useState(null);
    const [identityPassword, setIdentityPassword] = useState("");
    const [aliceBucketMockup, setAliceBucketMockup] = useState(0);
    const [selectedFile, setSelectedFile] = useState();

    // const storage = new StorageMechanism();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const aliceMockup1 = async () => {
        setAliceBucketMockup(1);

        // Push a file to the Bucket
        console.log("Pushing a test file to Textile Bucket");
        const path = "testfile"
        // const string = "Hello world!"
        const string = "Hello world!"
        const binaryStr = new TextEncoder().encode(string);
        // TODO: Fix: the following line causes this warning:
        //       "Warning: findDOMNode is deprecated in StrictMode. findDOMNode was passed an instance of Transition
        //       which is inside StrictMode. Instead, add a ref directly to the element you want to reference. Learn
        //       more about using refs safely here: https://reactjs.org/link/strict-mode-find-node"
        const raw = await buckets.pushPath(bucketKey, path, binaryStr)

        console.log("raw", raw);

        // Read back test file from the Bucket
        console.log("Reading test file from Textile Bucket");
        try {
            const data = buckets.pullPath(bucketKey, path)
            const { value } = await data.next();
            console.log("data value", value)
            let str = "";
            for (let i = 0; i < value.length; i++) {
                str += String.fromCharCode(parseInt(value[i]));
            }
            console.log("str", str);

        } catch (error) {
            console.log("Error while loading file from bucket", error)
        }


        // storage.insertFile(buckets, bucketKey, './templates/output_test.md', 'output_test.md').then(result => {
        //     console.log("Insert file result", result);
        // });
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

    const generateIdentity = async () => {
        console.log("Attempting to generate identity (keypair) based on password and metamask signature");
        const identityResult = await storage.generatePrivateKey(identityPassword);
        if(identityResult) {
            console.log("Identity generated successfully");
            await setIdentity(identityResult);
            // Store identity in local storage
            storage.saveIdentity(who, identityResult);

            // NOTE: setIdentity is likely to return before 'identity' is actually updated (ie. it's an async update)
            console.log("identityResult", identityResult);  // TODO: Remove this
            console.log("identity", identity);  // TODO: Remove this
        }
    }

    const forgetIdentity = async () => {
        console.log("Forgetting identity");
        storage.clearIdentity(who);
        setIdentity(null);
    }

    const connectToTextile = async () => {
        console.log("Connecting to Textile");
        if(!identity) {
            console.log("Can't connect to Textile, identity not found")
            return;
        }
        // Perform basic development auth connecting Alice to Endowl API key
        console.log("Authorizing identity to use Textile with Endowl API key");
        const client = await storage.authorizeTextileUser(storage.keyInfo, identity);
        console.log("client", client);

        // Open/create Bucket and fetch details
        console.log("Fetching Textile Bucket details");
        // const {buckets, bucketKey} = await storage.setupBucket(storage.keyInfo, identity);
        const result = await storage.setupBucket(storage.keyInfo, identity);
        console.log("buckets", result.buckets);
        console.log("bucketKey", result.bucketKey);
        setBuckets(result.buckets);
        setBucketKey(result.bucketKey);
    }

    const fileChange = async (event) => {
        console.log("Selected file");
        console.log("event", event);
        const file = event.target.files[0];
        console.log("file", file);
        setSelectedFile(file);
    }

    const fileUpload = async (event) => {
        console.log("Uploading file to Textile");
        const path = "test_path";
        const result = await storage.insertFile(buckets, bucketKey, selectedFile, path);
        console.log("Done uploading file to Textile")
        console.log("result", result);

        // TODO: Move this
        // Read back test file from the Bucket
        console.log("Reading test file from Textile Bucket");
        // TODO: Create link to download/view the retrieved file
        try {
            const data = buckets.pullPath(bucketKey, path)
            const { value } = await data.next();
            console.log("data value", value)
            let str = "";
            for (let i = 0; i < value.length; i++) {
                str += String.fromCharCode(parseInt(value[i]));
            }
            console.log("str", str);

        } catch (error) {
            console.log("Error while loading file from bucket", error)
        }

    }

    /*
    useEffect(() => {
        async function doAsyncStuff() {
            // localStorage.clear(); // TODO: Remove this after debugging
        doAsyncStuff();
    }, [])
     */


    const setState = path => ({target: {value}}) => {
        const newDocProps = set({...docProps}, path, value)
        setDocProps(newDocProps)
    }

    return (
        <>
            <header className="App-header">
                <h1>Alice's Secure Shared Documents</h1>

                <img src={owlalice} className="App-logo" alt="logo" style={{maxWidth:"200px", height:"auto"}} />

                {!identity && (
                    <>
                        <p>
                            Create Textile identity
                        </p>
                        <input type="text" placeholder="textile password" value={identityPassword} onChange={e => {setIdentityPassword(e.target.value)}} /><br />
                        <Button variant="primary" onClick={generateIdentity}>
                            Generate identity with Metamask
                        </Button>
                    </>
                )}
                {identity && (
                    <>
                        <p>
                            Textile identity:<br />
                            <small>{identity.public.toString()}</small><br />
                            <Button variant="danger" onClick={forgetIdentity}>
                                Forget Identity
                            </Button>
                        </p>

                        {!bucketKey && (
                            <>
                                <p>
                                    Connect to Textile Buckets
                                </p>
                                <Button variant="success" onClick={connectToTextile}>
                                    Connect
                                </Button>
                            </>
                        )}

                        {bucketKey && (
                            <>
                                <p>
                                    Upload document to Textile Bucket
                                </p>
                                <input type="file" id="upload" onChange={fileChange} />
                                <Button variant="success" onClick={fileUpload}>
                                    Upload
                                </Button>

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
                            </>
                        )}
                    </>
                )}


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
                <img src={owlfred} alt="Owlfred" style={{height: "50px", width: "auto"}} /> Owlfred
            </Link>
            <Link to="/alice">
                <img src={owlalice} alt="Alice" style={{height: "50px", width: "auto"}} /> Alice
            </Link>
            <Link to="/bob">
                <img src={owlbob} alt="Bob" style={{height: "50px", width: "auto"}} /> Bob
            </Link>
        </header>
    )
}

export default App;
