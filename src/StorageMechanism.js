import {Buckets, Client, PrivateKey} from "@textile/hub";
import {BigNumber, providers, utils} from "ethers";

// Use Textile Buckets for persistent secure storage
// Use Metamask signing combined with a secret password to generate keypair used to authenticate with Textile

class StorageMechanism {
    // TODO: Stop using "insecure keys" method for development, switch to production authentication:
    //       https://docs.textile.io/tutorials/hub/production-auth/
    keyInfo = {
        key: 'b3xgautdgxk7orkk2m53avfteyi',  // Endowl 'INSECURE API KEY',
    }
    keyInfoOptions = {
        debug: false
    }
    localStoragePrefix = "textile.identity.";

    /**
     * getIdentity uses a basic private key identity.
     * The user's identity will be cached client side. This is long
     * but ephemeral storage not sufficient for production apps.
     *
     * Read more here:
     * https://docs.textile.io/tutorials/hub/libp2p-identities/
     */
    // async function getIdentity(who) {
    // function getIdentity(who) {
    getSavedIdentity = (who) => {
        // TODO: Generate identity (and in affect private key) using a non-random method
        // const localStorageKey = "textile.identity." + who;
        const localStorageKey = this.localStoragePrefix + who;
        try {
            let storedIdent = localStorage.getItem(localStorageKey);
            if (storedIdent === null) {
                throw new Error('No identity')
            }
            const restored = PrivateKey.fromString(storedIdent)
            console.log("Textile identity loaded from local storage")
            return restored
        }
        catch (e) {
            console.log("Failed to load saved Textile identity from local storage.")
        }
    }

    // save private key from identity to local storage
    saveIdentity = (who, identity) => {
            try {
                const localStorageKey = this.localStoragePrefix + who;
                const identityString = identity.toString()
                localStorage.setItem(localStorageKey, identityString)
                console.log("Textile identity saved to local storage")
                // return identity
                return true;
            } catch (err) {
                return err.message
            }
    }


    // Authenticate user on Textile with Endowl API keys
    // async function authorizeTextileUser (key, identity) {
    authorizeTextileUser = async (key, identity) => {
        const client = await Client.withKeyInfo(key)
        await client.getToken(identity)
        return client
    }


    // Open or create user owned Textile Bucket
    // async function setupBucket(key, identity) {
    setupBucket = async (key, identity) => {
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

    insertFile = (buckets, bucketKey, file, path) => {
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

    // function generateMessageForEntropy(ethereum_address, application_name, secret) {
    generateMessageForEntropy = (ethereum_address, application_name, secret) => {
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
            // ethereum_address.value +
            ethereum_address +
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

    getSigner = async() => {
        if (!window.ethereum) {
            throw new Error(
                'Ethereum is not connected. Please download Metamask from https://metamask.io/download.html'
            );
        }

        console.debug('Initializing web3 provider...');
        const provider = new providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        return signer
    }


    getAddressAndSigner = async() => {
        const signer = await this.getSigner()
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length === 0) {
            throw new Error('No account is provided. Please provide an account to this application.');
        }

        const address = accounts[0];

        return {address, signer}
    }

    // Use supplied password combined with MetaMask signature to generate an identity
    generatePrivateKey = async(identityPassword) => {
        const metamask = await this.getAddressAndSigner()
        // avoid sending the raw secret by hashing it first
        console.log("metamask.address", metamask.address);  // TODO: Remove this
        console.log("identityPassword", identityPassword);  // TODO: Remove this
        // Do not use a randomized hashing mechanism, we want this password+wallet signature to always create the same keypair
        // const secret = hashSync(identityPassword, 10)
        // Use a hash function that for any given input always produces the same output.
        let applicationName = 'Endowl MVP';
        const secret = utils.keccak256(utils.solidityKeccak256(['string', 'string'], [identityPassword, applicationName]))
        console.log("secret", secret);  // TODO: Remove this
        const message = this.generateMessageForEntropy(metamask.address, applicationName, secret)
        const signedText = await metamask.signer.signMessage(message);
        const hash = utils.keccak256(signedText);
        if (hash === null) {
            throw new Error('No account is provided. Please provide an account to this application.');
        }
        // The following line converts the hash in hex to an array of 32 integers.
        const array = hash
            .replace('0x', '')
            .match(/.{2}/g)
            .map((hexNoPrefix) => BigNumber.from('0x' + hexNoPrefix).toNumber())

        if (array.length !== 32) {
            throw new Error('Hash of signature is not the correct size! Something went wrong!');
        }
        const identity = PrivateKey.fromRawEd25519Seed(Uint8Array.from(array))
        console.log("identity.toString() [private key]", identity.toString())

        // this.createNotification(identity)
        console.log("identity.public.toString()", identity.public.toString())

        // Your app can now use this identity for generating a user Mailbox, Threads, Buckets, etc
        return identity
    }

}

export default StorageMechanism;
