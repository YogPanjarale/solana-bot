import { Error } from "../types";
import { OffChainData, Root } from "../types/Root";
import fetch from 'node-fetch'
export class TheBlockChainApi {
	keyid: string;
	keysecret: string;

	constructor(keyid: string, keysecret: string) {
		this.keyid = keyid;
		this.keysecret = keysecret;
	}
	async solanaGetNFTsBelongingToWallet({
		wallet,
		network = "mainnet-beta",
	}: {
		wallet: string;
		network: string;
	}): Promise<OffChainData[] | Error> {

		const url =
			`https://api.blockchainapi.com/v1/solana/wallet/${network}/${wallet}/nfts`;
		const response = await fetch(url, {
            method: 'GET',
            headers: {APIKeyID: this.keyid, APISecretKey: this.keysecret}
          });
        const json = await response.json();
        console.log(json);
        if (json.error_message){
            return {
                errors: [{
                    msg: json.error_message     
                }]
            }
        }
        const data = json as Root;
        return data.nfts_metadata.map(({off_chain_data}) =>off_chain_data );
	}
}
