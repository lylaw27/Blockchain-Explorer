'use client'

import {use, useEffect, useState} from "react";
import startWebSocket from "@/hooks/websocket";
import Switcher from "@/components/Switcher";
import AssetInfo from "@/components/AssetInfo";
import Navigation from "@/components/Navigation";
import {BlockDisplay, PeerStatus, TxDisplay} from "@/Types/types";
import LeftArrow from "@/app/svg/arrow";
import GreenStatus from "@/app/svg/greenStatus";
import RedStatus from "@/app/svg/redStatus";
import {useParams} from "next/navigation";
import Link from "next/link";
import {Truncate} from "@/components/HelperFunc";


export default function Home(){
    const portNumber = 9090;
    return(
        <NodePage portNumber={portNumber}/>
        )
}


export function NodePage({portNumber}:{portNumber:number}) {
    const [txList,setTxList] = useState<TxDisplay[]>([]);
    const [peerList,setPeerList] = useState<PeerStatus[]>([]);
    const [blockList,setBlockList] = useState<BlockDisplay[]>([]);
    const [blockHeight,setBlockHeight] = useState<number>(-1);
    const [nodeStatus,setNodeStatus] = useState<boolean>(true);
    const [walletList,setWalletList] = useState<string[]>([]);

    const toggleStatus = async() => {
        const status = await fetch(`http://127.0.0.1:8080/node/${portNumber}/status`,{
            method:'POST'
        }).then((res)=> res.text())
        setNodeStatus((status === "true"));
    }

    useEffect(() => {
        startWebSocket(portNumber,setWalletList,setTxList,setBlockList,setPeerList);
    },  []);
    useEffect(() => {
        if(blockList.length>0){
            setBlockHeight(blockList[0].height);
        }
    }, [blockList]);
    

    return (
      <div className="container mx-auto tex-2xl px-10">
        <Navigation/>
          <div className="rounded-xl space-x-10 m-auto w-1/2">
              <h1 className="text-grey-900 font-bold text-3xl text-center pb-5">Node: {portNumber}</h1>
              <div className="grid grid-cols-2 gap-3 justify-items-center">
                  <div className="text-grey-900 font-bold text-xl">Status</div>
                  <div className="text-grey-900 font-bold text-xl">Block Height</div>
              </div>
              <div className="grid grid-cols-2 gap-3 justify-items-center">
                  {nodeStatus ?
                      <div className="flex items-center"><GreenStatus/> <div className="px-2 text-xl">Online</div></div> :
                      <div className="flex items-center"><RedStatus/> <div className="px-2 text-xl">Offline</div></div>}
                  <div className="px-2 text-xl">{blockHeight}</div>
              </div>
              <div className="flex justify-center pt-5">
              {nodeStatus ?
                <button type="button" className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                        onClick={toggleStatus}>Shutdown Node</button>:
                <button  type="button" className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                         onClick={toggleStatus}>Boot Up Node</button>
              }
              </div>
          </div>
          <div className="flex container mx-auto flex-wrap gap-5 py-5">
              <div className="space-x-10">
                  <div className="p-6 bg-teal-400 rounded-xl flex-col justify-center">
                      <h1 className="text-grey-900 font-bold text-2xl text-center pb-5">Blockchain</h1>
                        <div className="flex flex-wrap">
                            {blockList.map((block,i)=>(
                                <Link href={`/node/${portNumber}/block/${block.height}`} className="flex hover:underline" key={i}>
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
                          <Link href={`/node/${peer.node}`} className="grid grid-cols-2 gap-3 justify-items-center hover:underline" key={i}>
                              <div>{peer.node}</div>
                              {peer.status ?
                                  <div className="flex items-center"><GreenStatus/>
                                      <div className="px-2">Online</div>
                                  </div> :
                                  <div className="flex items-center"><RedStatus/>
                                      <div className="px-2">Offline</div>
                                  </div>}
                          </Link>
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
                          <Link href={`/node/${portNumber}/wallet/${address}`} className="grid grid-cols-1 gap-3 justify-items-center hover:underline" key={i}>
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
                          <Link href={`/node/${portNumber}/transaction/${tx.txHash}`} className="grid grid-cols-2 gap-3 justify-items-center hover:underline" key={i}>
                              <div>{Truncate(tx.txHash)}</div>
                              <div>{tx.amount}</div>
                          </Link>
                      ))}
                  </div>
              </div>
              </div>
      </div>
  );
}

