'use client'
import {NodePage} from "@/app/page";
import {useParams} from "next/navigation";


const Spacer = () =>{
    return <div className="py-2"></div>
}

export default function Server(){
    const portNumber = parseInt(useParams().port as string);
    return(
        <NodePage portNumber={portNumber}/>
    )
}
