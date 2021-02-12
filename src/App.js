import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';
// import logo from './endowl-logo.png';
import owlfred from './owlfred/alfred.svg';
import owlalice from './owlalice/alfred.svg';
import owlbob from './owlbob/alfred.svg';
import './App.css';
import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";
// import hub from '@textile/hub'
import {Client} from '@textile/hub';
import {useState} from "react";
import {Button, Form} from "react-bootstrap";

const keyinfo = {
  key: 'bscp24bwolbgs7ciwbxkgsoh6a4',  // 'INSECURE API KEY',
}

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

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

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
                            <Form.Control />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Policy #</Form.Label>
                            <Form.Control />
                        </Form.Group>
                    </Form>
                    <code>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
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

function AliceEditDoc() {
    return (
        <header className="App-header">

        </header>
    )
}

function Bob() {
    return (
        <header className="App-header">
            <h1>Bob the Beneficiary</h1>

            <img src={owlbob} className="App-logo" alt="logo" style={{maxWidth:"200px", height:"auto"}} />

            <p>
                Open Alice's document encrypted for Bob from Textile bucket
            </p>
            <ul>
                <li><a href="#">Last Will &amp; Testament</a></li>
            </ul>

            <p>
                Request Alfred deliver Alice's post-mortem document encrypted for Bob:
            </p>

            <p>
                Open Alice's post-mortem document encrypted for Bob:
            </p>
        </header>
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
