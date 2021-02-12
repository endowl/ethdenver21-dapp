import {curve} from "@futuretense/curve25519-elliptic";
import {PRE} from "@futuretense/proxy-reencryption";
import {GRANT_CONDITIONS} from "./FakeNucypher";

class Character {
    constructor(name) {
        this.name = name;
        this.privateKey = curve.randomScalar()
        this.proxyReencrypter = new PRE(this.privateKey.toBuffer(), curve)
    }

    get publicKey() {
        this.privateKey.curve.basepoint.mul(bobPriv).toBuffer()
    }

    getProxyReencryptionKeys(otherPub) {
        return GRANT_CONDITIONS.map(c => his.proxyReencrypter.generateReKey(otherPub, c))
    }

    async encrypt(message, grantCondition) {
        return this.proxyReencrypter.selfEncrypt(message, grantCondition)
    }

    async decrypt(messages) {
        return Promise.all(messages.map(m => m && this.proxyReencrypter.reDecrypt(m).then(m => m.toString()), []))
    }
}

export default Character