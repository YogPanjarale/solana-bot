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
export {
    CollectionResponse,
    TokensResponse,
	ConversionResponse,
    Data,
    Error,
    ErrorObj,
	TokenListing
}