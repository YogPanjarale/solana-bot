import fetch from "node-fetch";
import { CollectionResponse, TokensResponse } from "../types";

export class MagicDen {
	/**
	 * Get token metadata by mint address
	 * @param token_mint
	 */
	async getTokens(token_mint: string): Promise<TokensResponse> {
		const url = `https://api-mainnet.magiceden.dev/v2/tokens/${token_mint}`;
		const response = await fetch(url, { redirect: "follow" });
		const json = await response.json();
		return json as TokensResponse;
	}
	async getTokenbyWallet(wallet_address: string): Promise<TokensResponse[]> {
		const url = `https://api-mainnet.magiceden.dev/v2/wallets/${wallet_address}/tokens?offset=0&limit=100&listedOnly=true`;
		const response = await fetch(url, { redirect: "follow" });
		const json = await response.json();
		return json as TokensResponse[];
	}

	async getCollections(
		offset: number = 0,
		limit: number = 10
	): Promise<CollectionResponse[]> {
		const url = `https://api-mainnet.magiceden.dev/v2/launchpad/collections?offset=${offset}&limit=${limit}`;
		const response = await fetch(url, { redirect: "follow" });
		const json = await response.json();
		return json as CollectionResponse[];
	}
}
