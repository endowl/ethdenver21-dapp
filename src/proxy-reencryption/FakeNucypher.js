import {PRE} from "@futuretense/proxy-reencryption";
import {curve} from "@futuretense/curve25519-elliptic";

export const GRANT_WHEN_ALIVE = 'alive'
export const GRANT_WHEN_DEAD = 'ded'
export const GRANT_CONDITIONS = [GRANT_WHEN_ALIVE, GRANT_WHEN_DEAD]

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

export default FakeNucypher