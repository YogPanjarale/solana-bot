const default_image =
    "https://cdn.discordapp.com/attachments/905834245312880661/955505864104628294/Image_2.png";
import {
    Pagination,
	PaginationResolver,
	PaginationType,
} from "@discordx/pagination";
import {
	Collection,
	CommandInteraction,
	MessageButton,
	MessageEmbed,
} from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import fetch from "node-fetch";
import { CollectionResponse, TokensResponse } from "../types";

import { Connection } from "@metaplex/js";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

interface Data {
	name: string;
	description: string;
	image: string;
}
export class Solana {
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

	async getCollections(limit: number = 10): Promise<CollectionResponse[]> {
		const url = `https://api-mainnet.magiceden.dev/v2/launchpad/collections?offset=0&limit=${limit}`;
		const response = await fetch(url, { redirect: "follow" });
		const json = await response.json();
		return json as CollectionResponse[];
	}
}

const Api = new MagicDen();

const ErrorEmbed = (err: string) =>
	new MessageEmbed({ title: "Error", description: err, color: "#DE1738" });
type ErrorObj = {
	value: string;
	msg: string;
	param: string;
	location: string;
};
type Error = {
	errors?: ErrorObj[];
	status?: number;
	message?: string;
};
const showError = async (error: string, interaction: CommandInteraction) => {
	const errorEmbed = ErrorEmbed(error);
	if (interaction.replied) {
		await interaction.editReply({
			embeds: [errorEmbed],
		});
	} else {
		await interaction.editReply({ embeds: [errorEmbed] });
	}
};
const checkError = async (result: Error, interaction: CommandInteraction) => {
	if (result.errors) {
		await showError(result.errors[0].msg, interaction);
		return true;
	}
	console.log(result);
	if (result.status == 500 && result.message) {
		await showError(result.message, interaction);
		return true;
	}
};
@Discord()
@SlashGroup({ name: "solana" })
export abstract class Group {
	@Slash("tokens", { description: "Get token metadata by mint address" })
	@SlashGroup("solana")
	async tokens(
		@SlashOption("address", { description: "Token's Mint address" })
		address: string,
		interaction: CommandInteraction
	): Promise<void> {
        try {
            
            const result = await Api.getTokens(address);
            
            if (await checkError(result as Error, interaction)) return;
            
            const { name, collection, image, externalUrl, owner } = result;
            const embed = new MessageEmbed({
                title: name,
                image: { url: image },
                // description: "0",
            });
            embed.setURL(externalUrl);
            embed.addField("Collection", collection);
            embed.addField("Owner", owner);
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await showError("Something went wrong", interaction);
        }
	}

	@Slash("wallet", { description: "get tokens by wallet address" })
	@SlashGroup("solana")
	async wallet(
		@SlashOption("address", {
			description: "wallet address or public key of owner",
		})
		address: string,
		interaction: CommandInteraction
	) {
		// await interaction.reply("Working on it ...");
		await interaction.deferReply();
		try {
			const metadata = await Solana.getNFTbyWallet(address);
			console.log(metadata);
			const err = metadata as Error;
			if (await checkError(err, interaction)) return;
			const links = metadata as string[];
			//start previous next end
			const embedX = new PaginationResolver(
				async (page: number, pagination: any) => {
					let data: Data;
					try {
						data = await Solana.datafromUri(links[page]);
					} catch (error) {
						data = {
							name: "Error Loading",
							description: "please try  next one",
							image: default_image,
						};
					}
					console.log(data);
					return new MessageEmbed()
						.setTitle(`**NFT's for wallet : ${address}  **`)
						.addField("Name", data.name)
						.addField("Description", data.description)
						.setImage(data.image)
						.setFooter({
							text: `NFT ${page + 1} of ${links.length}  `,
						});
				},
				links.length
			);

			const pagination = new Pagination(interaction, embedX, {
				// ephemeral: true,
				onTimeout: () => {
					interaction.editReply("TimedOut");
				},

				time: 5 * 60 * 1000,
				type:
					links.length > 20
						? PaginationType.SelectMenu
						: PaginationType.Button,
			});

			await pagination.send();
		} catch (error) {
			console.log(error);
			showError("Error Occured", interaction);
		}
	}

	@Slash("get_collections", { description: "Get collections" })
	@SlashGroup("solana")
	async collections(
		@SlashOption("limit", { description: "Limit", required: false })
		limit: number,
		interaction: CommandInteraction
	): Promise<void> {
		const result = await Api.getCollections(limit);
		if (result.length == 0) {
			const errorEmbed = ErrorEmbed("No collections found");
			await interaction.reply({ embeds: [errorEmbed] });
			return;
		}
		// if (checkError(result as Error, interaction)) return;
		const cols = result as CollectionResponse[];
		try {
			const pages = cols.map((col, i) => {
				return new MessageEmbed()
					.setFooter({
						text: `Collection ${i + 1} of ${cols.length}`,
					})
					.setTitle("**Launchpad / Collection**")
					.addField("Name", col.name)
					.addField("Symbol", col.symbol)
					.addField("Description", col.description.substring(0,1000))
					.addField("Price", col.price.toString() + " SOL")
					.addField("Total Supply", col.size.toString())
					.addField("Launch Date", col.launchDatetime || "-")
					.setImage(col.image);
			});
			const pagination = new Pagination(interaction, pages, {
				type:
					limit > 20
						? PaginationType.SelectMenu
						: PaginationType.Button,
				showStartEnd: true,
				time: 5 * 60 * 1000,
			});
			await pagination.send();
		} catch (error) {
			console.log(error);
			showError("Error Occured", interaction);
		}
	}
}
