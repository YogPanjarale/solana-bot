import fetch from "node-fetch";
import { CollectionResponse, CollectionList, TokenListing, TokensResponse, CollectionStat } from "../types";

export class MagicDen {
	authkey?: string;
	constructor(authkey?: string) {
		this.authkey = authkey;
	}

	private fetch(url: string)  {
		return fetch(url, {
			redirect: "follow",
			headers: {
				Authorization: `Bearer ${this.authkey}`,
			},
		});
	}
	/**
	 *
	 * Get token metadata by mint address
	 * @param token_mint
	 */
	async getTokens(token_mint: string): Promise<TokensResponse> {
		const url = `https://api-mainnet.magiceden.dev/v2/tokens/${token_mint}`;
		const response = await this.fetch(url);
		const json = await response.json();
		return json as TokensResponse;
	}
	async getTokenListing(token_mint: string): Promise<TokenListing[]> {
		const url = `https://api-mainnet.magiceden.dev/v2/tokens/${token_mint}/listings`;
		const response = await this.fetch(url)
		const json = await response.json();
		return json as TokenListing[];
	}
	async getCollectionStats(symbol: string): Promise<CollectionStat[]> {
		const url = `https://api-mainnet.magiceden.dev/v2/collections/${symbol}/stats`;
		const response = await this.fetch(url)
		const json = await response.json();
		return json as CollectionStat[];
	}
	async getTokenbyWallet(wallet_address: string): Promise<TokensResponse[]> {
		const url = `https://api-mainnet.magiceden.dev/v2/wallets/${wallet_address}/tokens?offset=0&limit=100&listedOnly=true`;
		const response = await this.fetch(url);
		const json = await response.json();
		return json as TokensResponse[];
	}

	async getCollections(
		offset: number = 0,
		limit: number = 10
	): Promise<CollectionResponse[]> {
		const url = `https://api-mainnet.magiceden.dev/v2/launchpad/collections?offset=${offset}&limit=${limit}`;
		const response = await this.fetch(url);
		const json = await response.json();
		return json as CollectionResponse[];
	}
	async getCollectionList(
		offset: number = 0,
		limit: number = 20,
		symbol: string
	): Promise<CollectionList[]> {
		const url = `https://api-mainnet.magiceden.dev/v2/collections/${symbol}/listings?offset=${offset}&limit=${limit}`;
		const response = await this.fetch(url);
		const json = await response.json();
		return json as CollectionList[];
	}
}

