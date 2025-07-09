export type Transaction = {
    inputs: TxInput[],
    outputs: TxOutput[],
    block: number | null
}

export type TxInput = {
    prevTxHash: string,
    coinbase?: boolean,
    prevOutIndex: number,
    signature: string,
    publicKey:string
}

export type TxOutput = {
    amount: string,
    address: string
}

export type TxDisplay = {
    txHash: string,
    amount: number
}

export type Block = {
    header: BlockHeader,
    transactions: Transaction[],
    height: number
}

export type Peer = {
    node: string,
    ip: string,
    status: boolean,
    height: number
}

export type BlockHeader = {
    prevHash: string,
    merkleRoot: string,
    nonce: number,
    difficulty: number,
    timestamp: number,
    height: number
}

export type BlockDisplay = {
    blockHash: string,
    height: number
}

export type Wallet = {
    address: string,
    balance: number,
    node: string,
    txList: string[]
}