import * as ExpoCrypto from "expo-crypto"

// TanStack DB generates ids with crypto.randomUUID / getRandomValues, which Hermes lacks.
const cryptoGlobal = (globalThis.crypto ??= {} as Crypto)
cryptoGlobal.getRandomValues ??= ExpoCrypto.getRandomValues as Crypto["getRandomValues"]
cryptoGlobal.randomUUID ??= ExpoCrypto.randomUUID as Crypto["randomUUID"]
