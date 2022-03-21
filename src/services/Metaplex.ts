import fetch from "node-fetch";
import { Data } from "../types";
import { Connection } from "@metaplex/js";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { default_image } from "../config.js";



export class Metaplex {
    static async getNFTbyWallet(wallet_address: string) {
        try {
            const connection = new Connection("mainnet-beta");
            const ownerPublickey = wallet_address;

            const nftsmetadata = await Metadata.findDataByOwner(
                connection,
                ownerPublickey
            );
            return nftsmetadata.map((v) => {
                return v.data.uri;
            });
        } catch (error) {
            return {
                status: 500,
                message: "Error Occured",
            };
        }
    }
    static async datafromUri(uri: string): Promise<Data> {
        const json: any = await (
            await fetch(uri, {
                timeout: 2000,
            })
        ).json();
        const data: Data = {
            name: json.name || "--",
            description: json?.description || "--",
            image: json?.image || default_image,
        };
        return data;
    }
}
