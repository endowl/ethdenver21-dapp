// import logo from './endowl-logo.png';
import owlfred from './owlfred/alfred.svg';
import owlalice from './owlalice/alfred.svg';
import owlbob from './owlbob/alfred.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
// import hub from '@textile/hub'

import {Buckets, Client, Identity, KeyInfo} from '@textile/hub';

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
                <h1>Team Alfred Demo</h1>

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
    return (
        <header className="App-header">
            <h1>Alice's Secure Shared Documents</h1>

            <img src={owlalice} className="App-logo" alt="logo" style={{maxWidth:"200px", height:"auto"}} />

            <p>
                Create document from template:
            </p>
            <ul>
                <li><a href="#">Last Will &amp; Testament</a></li>
            </ul>

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
