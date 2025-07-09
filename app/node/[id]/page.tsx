'use client'
import {NodePage} from "@/app/page";
import {useParams} from "next/navigation";


export default function Server(){
    const nodeId = useParams().id;
    return(
        <>
            {
                nodeId ?
                    <NodePage nodeId={nodeId}/> :
                    <></>
            }
        </>
    )
}
