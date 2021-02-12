import "@futuretense/proxy-reencryption"
import {curve} from "@futuretense/curve25519-elliptic";
import {PRE} from "@futuretense/proxy-reencryption";

const GRANT_WHEN_ALIVE = 'alive'
const GRANT_WHEN_DEAD = 'ded'
const GRANT_CONDITIONS = [GRANT_WHEN_ALIVE, GRANT_WHEN_DEAD]

class Character {
    constructor(name) {
        this.name = name;
        this.privateKey = curve.randomScalar()
        this.proxyReencrypter = new PRE(this.privateKey.toBuffer(), curve)
    }

    get publicKey() {
        return curve.basepoint.mul(this.privateKey).toBuffer()
    }

    getProxyReencryptionKeys(otherPub) {
        return GRANT_CONDITIONS.map(c => this.proxyReencrypter.generateReKey(otherPub, c))
    }

    async encrypt(message, grantCondition) {
        return this.proxyReencrypter.selfEncrypt(message, grantCondition)
    }

    async decrypt(messages) {
        return Promise.all(messages.map(m => m && this.proxyReencrypter.reDecrypt(m).then(m => m.toString()), []))
    }
}

class FakeNucypher {
    constructor() {
        this.isAlive = true
        this.rekeyAlive = undefined
        this.rekeyDead = undefined
    }

    setDead() {
        this.isAlive = false
    }

    registerRekey([rekeyAlive, rekeyDead]) {
        this.rekeyAlive = rekeyAlive
        this.rekeyDead = rekeyDead
    }

    rekeyMessages(messages, receiverPubKey) {
        console.log('Alice is', this.isAlive ? 'alive' : 'dead')
        const activeRekey = this.isAlive ? this.rekeyAlive : this.rekeyDead
        return Promise.all(messages.map(em => {
            let dm = undefined
            try {
                dm = PRE.reEncrypt(receiverPubKey, em, activeRekey, curve)
            } finally {
                return dm
            }

        }, []))
    }
}

let alicesAlfred = new FakeNucypher()
let alice = new Character('alice')
let bob = new Character('bob')

// Alice transfers rekeys to FakeNucypher
alicesAlfred.registerRekey(alice.getProxyReencryptionKeys(bob.publicKey))

// Alice encrypts messages
const messages = [
    await alice.encrypt(Buffer.from("Attack at dawn."), GRANT_WHEN_ALIVE),
    await alice.encrypt(Buffer.from("Stop your attack, I'm dead."), GRANT_WHEN_DEAD),
]

// Bob request rekeying from FakeNucypher, then decrypts
console.log(await bob.decrypt(await alicesAlfred.rekeyMessages(messages, bob.publicKey)))

// Alice dies
alice = undefined
alicesAlfred.setDead()

// FakeNucypher rekeys the messages and bob reads them
console.log(await bob.decrypt(await alicesAlfred.rekeyMessages(messages, bob.publicKey)))

