'use client'

import {useEffect, useState} from "react";
import Navigation from "@/components/Navigation";
import {Transaction, TxOutput, Wallet} from "@/Types/types";
import {useParams} from "next/navigation";
import {Hash, Truncate, TruncateHash} from "@/components/HelperFunc";
import Link from "next/link";
import MoneyPending from "@/app/svg/moneyPending";
import MoneyOut from "@/app/svg/moneyOut";
import MoneyIn from "@/app/svg/moneyIn";


export default function WalletPage() {
    const address = useParams().wallet;
    const [wallet,setWallet] = useState<Wallet | null>();
    const [incomingOutputList,setIncomingOutputList] = useState<TxOutput[][]>([[]]);
    const [txList,setTxList] = useState<Transaction[]>([]);

    const getWalletInfo = async()=>{
        const walletUrl = `http://127.0.0.1:8080/wallet/${address}`;
        const walletRes = await fetch(walletUrl,{method:'GET'});
        if(!walletRes.ok){
            setWallet(null);
            return;
        }
        const walletInfo:Wallet = await walletRes.json();
        setWallet(walletInfo);
        return walletInfo;
    }

    const getTxRecord = async(walletInfo:Wallet)=>{
        if(walletInfo.txList.length == 0){
            setTxList([]);
            return;
        }
        const promises = walletInfo.txList.map(async TxID => {
            const txUrl = `http://127.0.0.1:8080/node/${walletInfo.node}/transaction/${TxID}`;
            const res = await fetch(txUrl, {method: 'GET'});
            return await res.json();
        })
        const sortedTx:Transaction[] = await Promise.all(promises);
        setTxList(sortedTx);
        return sortedTx;
    }

    const checkTxType = (idx:number)=>{
        console.log(txList[idx]);
        if(txList[idx].block == -1){
            return(<MoneyPending/>)
        }
        // for(const txInput of txList[idx].inputs){
        //     const address = Hash(txInput.publicKey);
        //     if(address === wallet?.address){
        //         return (<MoneyOut/>)
        //     }
        // }
        if(computeAmount(idx)<0){
            return (<MoneyOut/>)
        }
        return (<MoneyIn/>);
    }


    const getIncomingOutputs = async(tx:Transaction[],walletInfo:Wallet) =>{
        const txPromises = tx.map(async (tx) => {
            const inputPromises = tx.inputs.map(async input => {
                if(input.coinbase){
                    return {address: "Block Reward",amount: tx.outputs[0].amount}
                }
                const url = `http://127.0.0.1:8080/node/${walletInfo?.node}/transaction/${input.prevTxHash}`;
                const res = await fetch(url, {method: 'GET'});
                if (!res.ok) {
                    return {};
                }
                const incomingTx = await res.json();
                return incomingTx.outputs[input.prevOutIndex];
            });
            const inputTxArray:TxOutput[] = await Promise.all(inputPromises);
            return inputTxArray;
        })
        const txArray:TxOutput[][] = await Promise.all(txPromises);
        setIncomingOutputList(txArray);
    }

    const computeFee = (idx:number) => {
        if(txList.length === 0 || incomingOutputList.length === 0){
            return "Retrieving Data...";
        }
        const outgoingAmount = txList[idx].outputs.reduce((sum, a) => sum + parseInt(a.amount), 0)
        const incomingAmount = incomingOutputList[idx].reduce((sum, a) => sum + parseInt(a.amount), 0)
        return incomingAmount-outgoingAmount;
    }

    const computeAmount = (idx:number)=>{
        if(txList.length === 0 || incomingOutputList.length === 0){
            return "Retrieving Data...";
        }
        const outgoingAmount = txList[idx].outputs.reduce((sum, a) => {
            if(a.address === wallet?.address){
                return sum + parseInt(a.amount);
            }
            return sum;
        }, 0)
        const incomingAmount = incomingOutputList[idx].reduce((sum, a) => {
            if(a.address === wallet?.address){
                return sum + parseInt(a.amount);
            }
            return sum;
        }, 0)
        return outgoingAmount-incomingAmount;
    }

    const toAddress = (idx: number)=>{
        for(const txInput of txList[idx].inputs){
            const address = Hash(txInput.publicKey);
            if(address === wallet?.address){
                for(const output of txList[idx].outputs){
                    if(output.address != wallet?.address){
                        return output.address;
                    }
                }
            }
        }
        return wallet?.address;
    }


    useEffect(() => {
        const fetchData = async()=>{
            const walletInfo = await getWalletInfo();
            if(!walletInfo || !walletInfo.txList){return;}
            const tx = await getTxRecord(walletInfo);
            if(!tx){return;}
            await getIncomingOutputs(tx,walletInfo);
        }
        fetchData();
    },  []);

    return (
        <div className="container mx-auto tex-2xl px-10">
        <Navigation/>
        {wallet ?
        <>
            <div className="p-6 rounded-xl space-x-10 m-auto">
                <h1 className="text-grey-900 font-bold text-3xl text-center pb-5">Wallet Address: {Truncate(wallet.address)}</h1>
                <div className="grid grid-cols-2 gap-3 justify-items-center">
                    <div className="text-grey-900 font-bold text-xl">Connected To: </div>
                    <div className="text-grey-900 font-bold text-xl">Balance:</div>
                </div>
                <div className="grid grid-cols-2 gap-3 justify-items-center">
                    <div className="px-2 text-xl">{wallet.node}</div>
                    <div className="px-2 text-xl">{wallet.balance}</div>
                </div>
            </div>
            {/*//Transaction Record*/}
            <div className="flex container mx-auto justify-center gap-5 py-5">
                <div className="p-6 bg-teal-400 rounded-xl">
                <h1 className="text-grey-900 font-bold text-2xl text-center pb-5">Transaction Records</h1>
                <div className="grid grid-cols-6 gap-6 justify-items-center">
                    <div className="text-grey-900 font-bold text-l">Type</div>
                    <div className="text-grey-900 font-bold text-l">TXID</div>
                    <div className="text-grey-900 font-bold text-l">From</div>
                    <div className="text-grey-900 font-bold text-l">To</div>
                    <div className="text-grey-900 font-bold text-l">Amount</div>
                    <div className="text-grey-900 font-bold text-l">Fee</div>
                </div>
                {txList.length != 0 && incomingOutputList.length === txList.length ? txList.map((tx, i) => (
                    <Link href={`/node/${wallet.node}/transaction/${wallet.txList[i]}`}
                          className="grid place-items-center grid-cols-6 gap-6 justify-items-center hover:underline py-1" key={i}>
                        <div className="w-10">{checkTxType(i)}</div>
                        <div>{TruncateHash(tx)}</div>
                        <div>{Truncate(incomingOutputList[i][0].address)}</div>
                        <div>{Truncate(toAddress(i))}</div>
                        <div>{computeAmount(i)}</div>
                        <div>{computeFee(i)}</div>
                    </Link>
                )):
                    <h1 className="text-center p-10">No Transactions Were Made Yet!</h1>
                }
                </div>
            </div>
        </>:
            <div className="p-6 rounded-xl space-x-10 m-auto w-1/2">
                <h1 className="text-grey-900 font-bold text-3xl text-center pb-5">Wallet Not Found</h1>
            </div>
            }
        </div>
    );
}

