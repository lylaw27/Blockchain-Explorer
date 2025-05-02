'use client'

import {useEffect, useState} from "react";
import Navigation from "@/components/Navigation";
import {Block} from "@/Types/types";
import {useParams} from "next/navigation";
import {Hash, Truncate, TruncateHash} from "@/components/HelperFunc";
import Link from "next/link";
import {Field} from "@/components/Field";


export default function BlockPage() {
    const blockHeight = useParams().height;
    const port = useParams().port;
    const [block,setBlock] = useState<Block | null>();

    useEffect(() => {
        const url = `http://127.0.0.1:8080/node/${port}/block/${blockHeight}`
        fetch(url,{
            method: 'GET'
        })
        .then(res=>{
            if(res.ok){
                return res.json()
            }
            throw new Error();
        })
        .then(obj=>{
            setBlock(obj);
        }).catch(
            ()=> setBlock(null)
        );
    },  []);

    return (
        <div className="container mx-auto tex-2xl px-10">
        <Navigation/>
        {block ?
        <>
            <div className="p-6 rounded-xl space-x-10 m-auto">
                <h1 className="text-grey-900 font-bold text-3xl text-center pb-5">Block: #{blockHeight}</h1>
                <div className="grid grid-cols-2 gap-3 justify-items-center">
                    <div className="text-grey-900 font-bold text-xl">Block Hash: </div>
                    <div className="text-grey-900 font-bold text-xl">Mined on:</div>
                </div>
                <div className="grid grid-cols-2 gap-3 justify-items-center">
                    <div className="px-2 text-xl">{TruncateHash(block?.header)}</div>
                    <div className="px-2 text-xl">{new Date(block?.header.timestamp*1000).toLocaleString("en-US")}</div>
                </div>
            </div>
            <div className="flex container mx-auto flex-wrap gap-5 py-5">
                {/*Block Details*/}
                <div className="space-x-10">
                    <div className="p-6 bg-teal-400 rounded-xl">
                        <h1 className="text-grey-900 font-bold text-2xl text-center pb-5">Block Details</h1>
                        <Field title="Block Height" content={blockHeight}/>
                        <Field title="Block Hash" content={TruncateHash(block?.header)}/>
                        <Link href={`/node/${port}/block/${blockHeight - 1}`} className="hover:underline">
                            <Field title="Previous Block Hash" content={Truncate(block.header.prevHash)}/>
                        </Link>
                        <Field title="Merkle Root" content={Truncate(block?.header.merkleRoot)}/>
                        <Field title="Difficulty" content={block?.header.difficulty}/>
                        <Field title="Nonce" content={block?.header.nonce}/>
                        <Field title="Miner" content={Truncate(block?.transactions[0].outputs[0].address)}/>
                        <Field title="Mined on:" content={new Date(block?.header.timestamp*1000).toLocaleString("en-US")}/>
                        <Field title="Total Transactions" content={block?.transactions.length}/>
                        <Field title="Total Amount" content={block?.transactions.reduce((total,tx)=>
                            tx.outputs.reduce((sum,output)=>
                                sum+parseInt(String(output.amount)),0)+total,0)}/>
                    </div>
                </div>
                {/*//Transaction List*/}
                <div className="space-x-10">
                    <div className="p-6 bg-teal-400 rounded-xl">
                        <h1 className="text-grey-900 font-bold text-2xl text-center pb-5">All Transcations</h1>
                        <div className="grid grid-cols-2 gap-3 justify-items-center">
                            <div className="text-grey-900 font-bold text-l">Confirmed TXID</div>
                            <div className="text-grey-900 font-bold text-l">Amount</div>
                        </div>
                        {block?.transactions.map((tx, i) => (
                            <Link href={`/node/${port}/transaction/${Hash(tx)}`} className="grid grid-cols-2 gap-3 justify-items-center hover:underline" key={i}>
                                <div>{TruncateHash(tx)}</div>
                                <div>{tx.outputs.reduce((sum,output)=>
                                    sum+parseInt(String(output.amount)),0)}</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>:
            <div className="p-6 rounded-xl space-x-10 m-auto w-1/2">
                <h1 className="text-grey-900 font-bold text-3xl text-center pb-5">Block Not Found</h1>
            </div>
            }
        </div>
    );
}

