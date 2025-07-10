'use client'

import {useEffect, useState} from "react";
import Navigation from "@/components/Navigation";
import {Transaction, TxInput, TxOutput} from "@/Types/types";
import {useParams} from "next/navigation";
import {Truncate} from "@/components/HelperFunc";
import {Field} from "@/components/Field";
import Link from "next/link";


export default function TransactionPage() {
    const TxID= useParams().hash?.toString();
    const [tx,setTx] = useState<Transaction | null>();
    const [inputAmount,setInputAmount] = useState<number>();
    const [outputAmount,setOutputAmount] = useState<number>();
    const [fee,setFee] = useState<number>();
    const mainnetIP = process.env.NEXT_PUBLIC_IP_ADDRESS;


    const getInputAmount = async(prevTxID:string,prevOutIndex:number) =>{
       const url = `http://${mainnetIP}/transaction/${prevTxID}`;
       const res= await fetch(url,{method: 'GET'});
       if(!res.ok){
           return 0;
       }
       const obj:Transaction = await res.json();
       return parseInt(obj.outputs[prevOutIndex].amount);
    }

    const getTxInfo = async() =>{
        const url = `http://${mainnetIP}/transaction/${TxID}`;
        const res= await fetch(url,{method: 'GET'});
        const txRes:Transaction = await res.json();
        if(!res.ok || txRes.block == -2){
            setTx(null);
            return;
        }
        const totalOutput:number = txRes?.outputs.reduce((sum:number,output:TxOutput)=>sum+parseInt(String(output.amount)),0)

        const promises = txRes.inputs.map(async input => {
            if (input.coinbase) {
                return totalOutput;
            } else {
                return await getInputAmount(input.prevTxHash,input.prevOutIndex);
            }
        });

        const inputArray = await Promise.all(promises);
        const totalInput = inputArray.reduce((sum,add)=>sum+add,0);

        setTx(txRes);
        setOutputAmount(totalOutput);
        setInputAmount(totalInput);
        setFee(totalInput-totalOutput);
    }

    useEffect(() => {
        getTxInfo();
    },  []);


    return (
        <div className="container mx-auto tex-2xl px-10">
        <Navigation/>
        {tx ?
        <>
            <div className="p-6 rounded-xl w-1/2 mx-auto">
                <h1 className="text-grey-900 font-bold text-3xl text-center pb-5">Transaction Hash: {Truncate(TxID)}</h1>
                <div className="grid grid-cols-2 gap-3 justify-items-center">
                    <div className="text-grey-900 font-bold text-xl">Amount: </div>
                    <div className="text-grey-900 font-bold text-xl">Status:</div>
                </div>
                <div className="grid grid-cols-2 gap-3 justify-items-center">
                    <div className="px-2 text-xl">{outputAmount}</div>
                    <div className="px-2 text-xl">{tx.block != -1 ? <Link className="hover:underline" href={`/block/${tx.block}`} >Confirmed by Block <div className="text-center">#{tx.block}</div></Link> : "Unconfirmed"}</div>
                </div>
            </div>
            <div className="flex container gap-5 py-5 justify-around">
                {/*Block Details*/}
                <div className="w-1/3">
                    <div className="p-6 bg-teal-400 rounded-xl">
                        <h1 className="text-grey-900 font-bold text-2xl text-center pb-5">Transaction Details</h1>
                        <Field title="Tx Hash" content={Truncate(TxID)}/>
                        <Field title="Coinbase" content={tx.inputs[0].coinbase ? "true" : "false"}/>
                        <Field title="No.of Inputs" content={tx.inputs.length}/>
                        <Field title="Input Value" content={inputAmount}/>
                        <Field title="No.of Outputs" content={tx.outputs.length}/>
                        <Field title="Output Value" content={outputAmount}/>
                        <Field title="Fees" content={fee}/>
                    </div>
                </div>
                <div className="w-1/3">
                {tx.inputs.map((input:TxInput, i)=>
                    <div className="p-6 bg-teal-400 rounded-xl mb-5 w-full" key={i}>
                        <h1 className="text-grey-900 font-bold text-2xl text-center pb-5">{`Transaction Input ${i}`}</h1>
                            <div>
                                <Link className="hover:underline" href={`/transaction/${input.prevTxHash}`}>
                                    <Field  title="Previous TxID" content={Truncate(input.prevTxHash)}/>
                                </Link>
                                <Field title="Output Index" content={input.prevOutIndex}/>
                                <Field title="Coinbase" content={input.coinbase ? "true" : "false"}/>
                                <Field title="Signature" content={Truncate(input.signature)}/>
                                <Field title="Public Key" content={Truncate(input.publicKey)}/>
                            </div>
                    </div>
                )}
                </div>
                <div className="w-1/3">
                    {tx.outputs.map((output:TxOutput, i)=>
                        <div className="p-6 bg-teal-400 rounded-xl mb-5 w-full" key={i}>
                            <h1 className="text-grey-900 font-bold text-2xl text-center pb-5">{`Transaction Output ${i}`}</h1>
                            <div>
                                <Field title="Amount" content={output.amount}/>
                                <Link className="hover:underline" href={`/wallet/${output.address}`}>
                                    <Field title="Address" content={Truncate(output.address)}/>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>:
            <div className="p-6 rounded-xl w-1/2">
                <h1 className="text-grey-900 font-bold text-3xl text-center pb-5">Transaction Not Found</h1>
            </div>
            }
        </div>
    );
}

