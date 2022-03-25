import fetch from 'node-fetch'
import { ConversionResponse } from '../types';

export async function convert(amount:number, from:string,to:string):Promise<ConversionResponse>{
    if (from==to) return {from,to,convertedAmount:amount,initalAmount:amount,rate:1}
    const invert = to=="solana"
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${invert?to:from}&vs_currencies=${invert?from:to}`
    if (invert){
        to = from
        from = "solana"
    }
    const res = await fetch(url);
    const json = await res.json();
    if (json[from] && json[from][to]) {
        const rate = json[from][to];
        const convertedAmount = invert ? amount/rate :amount * rate;
        return {
            from: invert?to:from,
            to: invert?from:to,
            convertedAmount,
            initalAmount: amount,
            rate : rate
        } 
    }
    throw new Error(`Could not convert ${from} to ${to}`)
}