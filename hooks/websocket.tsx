import {Client} from '@stomp/stompjs'
import {createHash} from "node:crypto";
import {BlockDisplay, BlockHeader, PeerStatus, Transaction, TxDisplay, Wallet} from "@/Types/types";
import {Hash} from "@/components/HelperFunc";


const startWebSocket = (nodePort:number,setWalletList,setTxList,setBlockList,setPeerList) =>{

    const client = new Client({
        brokerURL: 'ws://localhost:8080/ws',
        onConnect: ()=>{
            client.subscribe(`/node/${nodePort}/transactions`, message =>{
                const responseArray = JSON.parse(message.body);
                const txArray:TxDisplay[] = [];
                responseArray.forEach((tx:Transaction)=>{
                    const amount = tx.outputs.reduce((sum,output)=>sum+parseInt(String(output.amount)),0);
                    txArray.push({txHash: Hash(tx),amount: amount});
                });
                setTxList(txArray);
            });

            client.subscribe(`/node/${nodePort}/blocks`, message =>{
                const responseArray = JSON.parse(message.body);
                const blockArray:BlockDisplay[] = [];
                responseArray.forEach((res)=>{
                    blockArray.push({blockHash: Hash(res.header),height:res.height});
                    console.log(Hash(res.header));
                })
                setBlockList(blockArray);
            });

            client.subscribe(`/node/${nodePort}/peers`, message =>{
                const messageArray = JSON.parse(message.body);
                const peerArray:PeerStatus[] = [];
                messageArray.forEach((msg:PeerStatus)=>{
                    const statusMsg = {...msg,status: msg.status === 'true'}
                    peerArray.push(statusMsg);
                });
                setPeerList(peerArray);
            })

            client.subscribe(`/node/${nodePort}/wallets`, message =>{
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
