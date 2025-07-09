import {Client} from '@stomp/stompjs'
import {Block, BlockDisplay, Peer, Transaction, TxDisplay, TxInput, TxOutput} from "@/Types/types";
import {Hash} from "@/components/HelperFunc";

const startWebSocket = (blockchainEndpoint,setWalletList,setTxList,setBlockList,setPeerList) =>{

    const client = new Client({
        brokerURL: `ws://${blockchainEndpoint}/ws`,
        onConnect: ()=>{
            client.subscribe(`/node/transactions`, message =>{
                const responseArray = JSON.parse(message.body);
                const txArray:TxDisplay[] = [];
                responseArray.forEach((tx:Transaction)=>{
                    const amount = tx.outputs.reduce((sum,output)=>sum+parseInt(String(output.amount)),0);
                    const inputs:TxInput[] = [];
                    const outputs:TxOutput[] = [];
                    tx.inputs.forEach((input)=>{
                        const txInput = {
                            prevTxHash:input.prevTxHash,
                            prevOutIndex: input.prevOutIndex,
                            publicKey:input.publicKey,
                            signature:input.signature,
                        }
                        inputs.push(txInput);
                    })
                    tx.outputs.forEach((output)=>{
                        const txOutput = {
                            amount:output.amount,
                            address:output.address,
                        }
                        outputs.push(txOutput);
                    })
                    const txOrg = {
                        inputs: inputs,
                        outputs: outputs
                    }
                    console.log(txOrg)
                    txArray.push({txHash: Hash(txOrg),amount: amount});
                });
                setTxList(txArray);
            });

            client.subscribe(`/node/blocks`, message =>{
                const responseArray = JSON.parse(message.body);
                const blockArray:BlockDisplay[] = [];
                responseArray.forEach((block:Block)=>{
                    const blockHeader = {
                        prevHash: block.header.prevHash,
                        merkleRoot: block.header.merkleRoot,
                        timestamp: block.header.timestamp,
                        nonce: block.header.nonce,
                        difficulty: block.header.difficulty,
                    }
                    blockArray.push({blockHash: Hash(blockHeader),height:block.height});
                })
                setBlockList(blockArray);
            });

            client.subscribe(`/node/peers`, message =>{
                const messageArray = JSON.parse(message.body);
                const peerArray:Peer[] = [];
                messageArray.forEach((msg:Peer)=>{
                    const statusMsg = {...msg,status: msg.status === 'true'}
                    peerArray.push(statusMsg);
                });
                setPeerList(peerArray);
            })

            client.subscribe(`/node/wallets`, message =>{
                const messageArray = JSON.parse(message.body);
                const walletArray:string[] = [];
                messageArray.forEach((address:string)=>{
                    walletArray.push(address);
                });
                setWalletList(walletArray);
            })
        },
    });
    console.log("connected!");
    client.activate();
    return client;
}

export default startWebSocket ;
