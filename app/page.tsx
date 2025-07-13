'use client'

import React, { useEffect, useState} from "react";
import startWebSocket from "@/hooks/websocket";
import Navigation from "@/components/Navigation";
import {BlockDisplay, Peer, TxDisplay} from "@/Types/types";
import LeftArrow from "@/app/svg/arrow";
import GreenStatus from "@/app/svg/greenStatus";
import RedStatus from "@/app/svg/redStatus";
import Link from "next/link";
import {Truncate} from "@/components/HelperFunc";

export default function NodePage() {
    const [txList,setTxList] = useState<TxDisplay[]>([]);
    const [peerList,setPeerList] = useState<Peer[]>([]);
    const [blockList,setBlockList] = useState<BlockDisplay[]>([]);
    const [blockHeight,setBlockHeight] = useState<number>(-1);
    const [mineStatus,setMineStatus] = useState<boolean>(false);
    const [genTxStatus,setGenTxStatus] = useState<boolean>(false);
    const [ipAddress,setIpAddress] = useState<string>("");
    const [nodeId,setNodeId] = useState<string>("");
    const [blockchainEndpoint,setBlockchainEndpoint] = useState<string | undefined>(process.env.NEXT_PUBLIC_IP_ADDRESS);

    const [walletList,setWalletList] = useState<string[]>([]);

    const getNodeStatus = async () => {
        const resText = await fetch(`http://${blockchainEndpoint}/status`,{
            method:'GET'
        }).then((res)=> res.text()).catch((err)=>{
            console.log(err)
        });
        if(resText){
            setNodeId(resText);
        }
    }

    const toggleMine = async() => {
        await fetch(`http://${blockchainEndpoint}/mine`,{
            method:'POST'
        }).then((res)=> res.text())
        await getMineStatus();
    }

    const getMineStatus = async() => {
        const status = await fetch(`http://${blockchainEndpoint}/mine`,{
            method:'GET'
        }).then((res)=> res.text())
        setMineStatus((status === "true"));
    }

    const toggleGenTx = async() => {
        await fetch(`http://${blockchainEndpoint}/gentx`,{
            method:'POST'
        }).then((res)=> res.text())
        await getGenTxStatus();
    }

    const getGenTxStatus = async() => {
        const status = await fetch(`http://${blockchainEndpoint}/gentx`,{
            method:'GET'
        }).then((res)=> res.text())
        setGenTxStatus((status === "true"));
    }

    const changeIP =(e:React.ChangeEvent<HTMLInputElement>) =>{
        setIpAddress(e.target.value);
    }

    const connectPeer = async () => {
        const status = await fetch(`http://${blockchainEndpoint}/connect/${ipAddress}`,{
            method:'POST'
        }).then(res=>res.text());
        if(status === "error"){
            alert("Peer IP address not found.");
        }
        else{
            alert(status);
        }
    }

    const changeNode = (ip: string) =>{
        setBlockchainEndpoint(ip);
    }

    useEffect(() => {
        getNodeStatus();
        startWebSocket(blockchainEndpoint,setWalletList,setTxList,setBlockList,setPeerList);
        getMineStatus();
        getGenTxStatus();
        console.log(blockchainEndpoint);
    },  [blockchainEndpoint]);
    useEffect(() => {
        if(blockList.length>0){
            setBlockHeight(blockList[0].height);
        }
    }, [blockList]);
    

    return (
      <div className="container mx-auto tex-2xl px-10">
        <Navigation/>
          <div className="rounded-xl space-x-10 m-auto w-1/2">
              <h1 className="text-grey-900 font-bold text-3xl text-center pb-5">Node: {nodeId}</h1>
              <div className="grid grid-cols-2 gap-3 justify-items-center">
                  <div className="text-grey-900 font-bold text-xl">Status</div>
                  <div className="text-grey-900 font-bold text-xl">Block Height</div>
              </div>
              <div className="grid grid-cols-2 gap-3 justify-items-center">
                  {nodeId ?
                      <div className="flex items-center"><GreenStatus/> <div className="px-2 text-xl">Online</div></div>:
                      <div className="flex items-center"><RedStatus/> <div className="px-2 text-xl">Offline</div></div>}
                  <div className="px-2 text-xl">{blockHeight}</div>
              </div>
              <div className="flex justify-center pt-5 gap-10">
              {mineStatus ?
                <button type="button" className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                        onClick={toggleMine}>Stop Mining ⛏️</button>:
                <button  type="button" className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                         onClick={toggleMine}>Start Mining ⛏️</button>
              }
              {genTxStatus ?
                  <button type="button" className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                          onClick={toggleGenTx}>Stop Generating Transactions 💵</button>:
                  <button  type="button" className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                           onClick={toggleGenTx}>Start Generating Transactions 💵</button>
              }
              </div>
          </div>
          <div className="flex container mx-auto flex-wrap gap-5 py-5">
              <div className="space-x-10">
                  <div className="p-6 bg-teal-400 rounded-xl flex-col justify-center">
                      <h1 className="text-grey-900 font-bold text-2xl text-center pb-5">Blockchain</h1>
                        <div className="flex flex-wrap">
                            {blockList.map((block,i)=>(
                                <Link href={`/block/${block.height}`} className="flex hover:underline" key={i}>
                                    <div className="w-5 h-20 flex items-center">
                                        <LeftArrow/>
                                    </div>
                                    <div className="flex-col justify-center">
                                        <div className="rounded w-20 h-20 bg-gradient-to-tr from-lime-500 to-lime-300 hover:to-lime-500"></div>
                                        <div className="text-center">#{block.height}</div>
                                        <div className="text-center">{Truncate(block.blockHash)}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                  </div>
              </div>
              <div className="space-x-10">
                  <div className="p-6 bg-teal-400 rounded-xl">
                      <h1 className="text-grey-900 font-bold text-2xl text-center pb-5">Peers</h1>
                      <div className="grid grid-cols-2 gap-3 justify-items-center">
                          <div className="text-grey-900 font-bold text-l">Nodes</div>
                          <div className="text-grey-900 font-bold text-l">Status</div>
                      </div>
                      {peerList.map((peer, i) => (
                          <div onClick={()=>changeNode(peer.ip)} className="grid grid-cols-2 gap-3 justify-items-center hover:underline hover:cursor-pointer" key={i}>
                              <div>{peer.node}</div>
                              {peer.status ?
                                  <div className="flex items-center"><GreenStatus/>
                                      <div className="px-2">Online</div>
                                  </div> :
                                  <div className="flex items-center"><RedStatus/>
                                      <div className="px-2">Offline</div>
                                  </div>}
                          </div>
                      ))}
                  </div>
              </div>
              <div className="space-x-10">
                  <div className="p-6 bg-teal-400 rounded-xl">
                      <h1 className="text-grey-900 font-bold text-2xl text-center pb-5">Connected Wallets</h1>
                      <div className="grid grid-cols-1 gap-3 justify-items-center">
                          <div className="text-grey-900 font-bold text-l">Address</div>
                      </div>
                      {walletList.map((address, i) => (
                          <Link href={`/wallet/${address}`} className="grid grid-cols-1 gap-3 justify-items-center hover:underline" key={i}>
                              <div>{Truncate(address)}</div>
                          </Link>
                      ))}
                  </div>
              </div>
              <div className="space-x-10">
                  <div className="p-6 bg-teal-400 rounded-xl">
                      <h1 className="text-grey-900 font-bold text-2xl text-center pb-5">MemPool</h1>
                      <div className="grid grid-cols-2 gap-3 justify-items-center">
                          <div className="text-grey-900 font-bold text-l">Unconfimred TXID</div>
                          <div className="text-grey-900 font-bold text-l">Amount</div>
                      </div>
                      {txList.map((tx, i) => (
                          <Link href={`/transaction/${tx.txHash}`} className="grid grid-cols-2 gap-3 justify-items-center hover:underline" key={i}>
                              <div>{Truncate(tx.txHash)}</div>
                              <div>{tx.amount}</div>
                          </Link>
                      ))}
                  </div>
              </div>
              <div className="space-x-10">
                  <div className="p-6 bg-teal-400 rounded-xl">
                      <h1 className="text-grey-900 font-bold text-2xl text-center pb-5">Establish Peer Connection</h1>
                      <div className="flex justify-between text-xl">
                          <input className="w-3/4" type="text" onChange={changeIP} value={ipAddress} placeholder="Enter IP Address"></input>
                      </div>
                      <div className="py-3"></div>
                      <button type="button" className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800" onClick={connectPeer}>Connect
                      </button>
                  </div>
              </div>
          </div>
      </div>
  )
}

