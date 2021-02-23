import 'bootstrap/dist/css/bootstrap.min.css';
// import logo from './endowl-logo.png';
import owlfred from './owlfred/alfred.svg';
import owlalice from './owlalice/alfred.svg';
import owlbob from './owlbob/alfred.svg';
import './App.css';
import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";
import {Buckets, Client, PrivateKey} from '@textile/hub';
import { BigNumber, providers, utils } from 'ethers'
import { hashSync } from 'bcryptjs'
import {useEffect, useState} from "react";
import {Button, Collapse} from "react-bootstrap";
import LetterToTrustedPerson from "./components/LetterToTrustedPerson";
import {set} from "lodash"
import OpolisDataModal from "./components/OpolisDataModal";
import aliceOpolisData from "./templates/example-data.json"
import Upload from "./components/Upload";

// TODO: Stop using "insecure keys" method for development, switch to production authentication:
//       https://docs.textile.io/tutorials/hub/production-auth/
const keyInfo = {
  // key: 'bscp24bwolbgs7ciwbxkgsoh6a4',  // Morgan 'INSECURE API KEY',
  key: 'b3xgautdgxk7orkk2m53avfteyi',  // Endowl 'INSECURE API KEY',
}
const keyInfoOptions = {
    debug: false
}

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
    // TODO: Generate identity (and in affect private key) using a non-random method
    const localStorageKey = "textile.identity." + who;
    try {
        var storedIdent = localStorage.getItem(localStorageKey);
        if (storedIdent === null) {
            throw new Error('No identity')
        }
        const restored = PrivateKey.fromString(storedIdent)
        console.log("Textile identity loaded from local storage")
        return restored
    }
    catch (e) {
        /**
         * If any error, create a new identity.
         */
        try {
            const identity = PrivateKey.fromRandom()
            const identityString = identity.toString()
            console.log("Textile identity created from random seed")
            localStorage.setItem(localStorageKey, identityString)
            console.log("Textile identity saved to local storage")
            return identity
        } catch (err) {
            return err.message
        }
    }
}

// Authenticate user on Textile with Endowl API keys
async function authorizeTextileUser (key, identity) {
  const client = await Client.withKeyInfo(key)
  await client.getToken(identity)
  return client
}


// Open or create user owned Textile Bucket
async function setupBucket(key, identity) {
  // Use the insecure key to set up the buckets client
  const buckets = await Buckets.withKeyInfo(key)
  // Authorize the user and your insecure app key with getToken
  await buckets.getToken(identity)

  // const result = await buckets.open('com.endowl.ethdenver21')
    let bucketName = 'com.endowl.ethdenver21';
    const result = await buckets.getOrCreate(bucketName)
  if (!result.root) {
    throw new Error('Failed to open bucket')
  }

  return {
      buckets: buckets,
      bucketKey: result.root.key,
  }
}

const insertFile = (buckets, bucketKey, file, path) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onabort = () => reject('file reading was aborted')
    reader.onerror = () => reject('file reading has failed')
    reader.onload = () => {
      const binaryStr = reader.result
      // Finally, push the full file to the bucket
      buckets.pushPath(bucketKey, path, binaryStr).then((raw) => {
        resolve(raw)
      })
    }
    reader.readAsArrayBuffer(file)
  })
}

function generateMessageForEntropy(ethereum_address, application_name, secret) {
    return (
        '******************************************************************************** \n' +
        'READ THIS MESSAGE CAREFULLY. \n' +
        'DO NOT SHARE THIS SIGNED MESSAGE WITH ANYONE OR THEY WILL HAVE READ AND WRITE \n' +
        'ACCESS TO THIS APPLICATION. \n' +
        'DO NOT SIGN THIS MESSAGE IF THE FOLLOWING IS NOT TRUE OR YOU DO NOT CONSENT \n' +
        'TO THE CURRENT APPLICATION HAVING ACCESS TO THE FOLLOWING APPLICATION. \n' +
        '******************************************************************************** \n' +
        'The Ethereum address used by this application is: \n' +
        '\n' +
        ethereum_address.value +
        '\n' +
        '\n' +
        '\n' +
        'By signing this message, you authorize the current application to use the \n' +
        'following app associated with the above address: \n' +
        '\n' +
        application_name +
        '\n' +
        '\n' +
        '\n' +
        'The hash of your non-recoverable, private, non-persisted password or secret \n' +
        'phrase is: \n' +
        '\n' +
        secret +
        '\n' +
        '\n' +
        '\n' +
        '******************************************************************************** \n' +
        'ONLY SIGN THIS MESSAGE IF YOU CONSENT TO THE CURRENT PAGE ACCESSING THE KEYS \n' +
        'ASSOCIATED WITH THE ABOVE ADDRESS AND APPLICATION. \n' +
        'AGAIN, DO NOT SHARE THIS SIGNED MESSAGE WITH ANYONE OR THEY WILL HAVE READ AND \n' +
        'WRITE ACCESS TO THIS APPLICATION. \n' +
        '******************************************************************************** \n'
    );
}





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
    const [show, setShow] = useState(false);
    const [identity, setIdentity] = useState(null)
    const [buckets, setBuckets] = useState(null);
    const [bucketKey, setBucketKey] = useState(null);
    const [identityPassword, setIdentityPassword] = useState("");

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

    const getSigner = async() => {
        if (!window.ethereum) {
            throw new Error(
                'Ethereum is not connected. Please download Metamask from https://metamask.io/download.html'
            );
        }

        console.debug('Initializing web3 provider...');
        // @ts-ignore
        const provider = new providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        return signer
    }


    const getAddressAndSigner = async() => {
        const signer = await getSigner()
        // @ts-ignore
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length === 0) {
            throw new Error('No account is provided. Please provide an account to this application.');
        }

        // const address = new EthereumAddress(accounts[0]);
        const address = accounts[0];

        return {address, signer}
    }

// async function generatePrivateKey(password) {
    const generatePrivateKey = async() => {
        const metamask = await getAddressAndSigner()
        // avoid sending the raw secret by hashing it first
        const secret = hashSync(identityPassword, 10)
        const message = generateMessageForEntropy(metamask.address, 'Endowl POC', secret)
        const signedText = await metamask.signer.signMessage(message);
        const hash = utils.keccak256(signedText);
        if (hash === null) {
            throw new Error('No account is provided. Please provide an account to this application.');
        }
        // The following line converts the hash in hex to an array of 32 integers.
        // @ts-ignore
        const array = hash
            // @ts-ignore
            .replace('0x', '')
            // @ts-ignore
            .match(/.{2}/g)
            .map((hexNoPrefix) => BigNumber.from('0x' + hexNoPrefix).toNumber())

        if (array.length !== 32) {
            throw new Error('Hash of signature is not the correct size! Something went wrong!');
        }
        const identity = PrivateKey.fromRawEd25519Seed(Uint8Array.from(array))
        console.log(identity.toString())

        // this.createNotification(identity)
        console.log(identity.public.toString())

        // Your app can now use this identity for generating a user Mailbox, Threads, Buckets, etc
        return identity
    }


    useEffect(() => {
        async function doAsyncStuff() {
            // localStorage.clear(); // TODO: Remove this after debugging

            // Setup basic user identity for Alice
            let id = getIdentity("alice");
            setIdentity(id);
            console.log("identity", identity);
            console.log("id", id);
            // NOTE: identity is still null at this point but gets updated asynchronously?
            console.log("public key", id.public.toString());
            if (!id) {
                throw new Error('Identity not set')
            }

            // Perform basic development auth connecting Alice to Endowl API key
            const client = await authorizeTextileUser(keyInfo, id);
            console.log("client", client);

            // Open/create Bucket and fetch details
            const {buckets, bucketKey} = await setupBucket(keyInfo, id);
            console.log("buckets", buckets);
            console.log("bucketKey", bucketKey);

            // Push a file to the Bucket
            const path = "testfile"
            const string = "Hello world!"
            const binaryStr = new TextEncoder().encode(string);
            const raw = await buckets.pushPath(bucketKey, path, binaryStr)

            console.log("raw", raw);

            // Read back test file from the Bucket
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

        doAsyncStuff();
    }, [])


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
                    Login to Textile
                </p>
                <input type="text" placeholder="textile password" value={identityPassword} onChange={e => {setIdentityPassword(e.target.value)}} />
                <Button variant="primary" onClick={generatePrivateKey}>
                    Login with Metamask
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
