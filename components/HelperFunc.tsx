import {sha256} from "js-sha256";

export const Hash = (obj:unknown) =>{
    if(obj == undefined){
        return "";
    }
    if(typeof obj === 'string'){
        return sha256(obj);
    }
    const objString = JSON.stringify(obj);
    return sha256(objString);
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
    return Truncate(sha256(objString));
}