import { TokensResponse } from "./tokens";
import { CollectionResponse } from "./collections";
import {TokenListing} from "./token_listing"
interface Data {
	name: string;
	description: string;
	image: string;
}
type ErrorObj = {
	value?: string;
	msg: string;
	param?: string;
	location?: string;
};
type Error = {
	errors?: ErrorObj[];
	status?: number;
	message?: string;
};
type ConversionResponse = {
	from: string;
	to:string;
	convertedAmount: number;
	initalAmount: number;
	rate:number
}
type CollectionStat = {
	symbol: string
	floorPrice?: number;
	listedCount?: number;
	volumeAll?: number;
	avgPrice24hr?:number;
}
type CollectionList ={
	pdaAddress: string;
	auctionHouse: string;
	tokenAddress: string;
	tokenMint: string;
	seller: string;
	tokenSize: number;
	price: number;
}
export {
    CollectionResponse,
	CollectionStat,
	CollectionList,
    TokensResponse,
	ConversionResponse,
    Data,
    Error,
    ErrorObj,
	TokenListing
}