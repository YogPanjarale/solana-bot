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
export {
    CollectionResponse,
    TokensResponse,
    Data,
    Error,
    ErrorObj,
	TokenListing
}