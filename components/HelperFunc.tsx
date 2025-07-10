import {createHash} from "node:crypto";

export const Hash = (obj:unknown) =>{
    if(obj == undefined){
        return "";
    }
    if(typeof obj === 'string'){
        return createHash('sha256').update(obj).digest('hex');
    }
    const objString = JSON.stringify(obj);
    return createHash('sha256').update(objString).digest('hex');
}

export const Truncate = (hash:string | undefined) =>{
    if(hash == undefined){
        return "";
    }
    if(hash === "Block Reward"){
        return hash;
    }
    return (hash.substring(0,4) + "-" + hash.substring(hash.length-4,hash.length)).toLowerCase();
}

export const TruncateHash = (obj:unknown) =>{
    if(obj == undefined){
        return "";
    }
    const objString = JSON.stringify(obj);
    return Truncate(createHash('sha256').update(objString).digest('hex'));
}