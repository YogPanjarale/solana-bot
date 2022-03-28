import {
	Pagination,
	PaginationResolver,
	PaginationType,
} from "@discordx/pagination";
import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { ButtonComponent, Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { CollectionResponse, ConversionResponse, Error, CollectionList  } from "../types";
import { MagicDen } from "../services/MagicDen.js";
import { default_image, mintColor, sidebarColor, blueColor } from "../config.js";
import { TheBlockChainApi } from "../services/theblockchainapi.js";
import { OffChainData } from "../types/Root";
import { formatAddress, formatFloor } from "../utils/format_address.js";
import { convert } from "../services/Currencies.js";

const CurrencyChoices = {
	"USD (US Dollar)":"USD",
	"EUR (euro)":"EUR",
	"JPY (Japanese Yen)":"JPY",
	"INR (India Rupee)" :"INR",
	 "KRW (South Korean Won)":"KRW",
	 "RUB (Russian Ruble)":"RUB",
}

const Api = new MagicDen();
const BApi = new TheBlockChainApi(
	process.env.API_KEY_ID || "",
	process.env.API_KEY_SECRET || ""
);

const ErrorEmbed = (err: string) =>
	new MessageEmbed({ title: "Error", description: err, color: "#DE1738" });

const showError = async (error: string, interaction: CommandInteraction) => {
	const errorEmbed = ErrorEmbed(error);
	if (interaction.replied || interaction.deferred) {
		await interaction.editReply({
			embeds: [errorEmbed],
		});
		return;
	} else {
		await interaction.reply({ embeds: [errorEmbed] });
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
export abstract class Group {
	@Slash("tokens", { description: "get token metadata by Mint address" })
	async tokens(
		@SlashOption("address", { description: "Token's Mint address" })
		address: string,
		interaction: CommandInteraction
	): Promise<void> {
		await interaction.deferReply();
		try {
			const result = await Api.getTokens(address);

			if (await checkError(result as Error, interaction)) return;

			const { name, collection, image, externalUrl, owner } = result;
			const embed = new MessageEmbed({
				title: name,
				image: { url: image },
				// description: "0",
			}).setColor(mintColor)
			embed.setURL(externalUrl)
			embed.addField("Collection", collection)
			embed.addField("Owner", owner)
			await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			await showError("Something went wrong", interaction);
		}
	}

	@Slash("token_listings", {
		description: "get token listing on Marketplaces by Mint address",
	})
	async tokenlisting(
		@SlashOption("address", { description: "Token's Mint address" })
		address: string,
		interaction: CommandInteraction
	): Promise<void> {
		try {
			const result = await Api.getTokenListing(address);
			
			if (await checkError(result as Error, interaction)) return;
			let listed = false
			if (result.length == 0) {
				await showError(
					"No Listing available for this token",
					interaction
				);
				return;
			}else{
				listed = true
			}
			const tokenDetails = await Api.getTokens(address);
			const { name, collection, image, externalUrl, owner } = tokenDetails;
			const { seller, price } = result[0];
			const embed = new MessageEmbed({
				title: listed?`Listings for ${formatAddress(address)}`:name,
			}).setColor(mintColor)
			.setImage(image||default_image)
			.setFooter({text:`${name} | ${collection} | ${owner}`})
			.setColor(mintColor)
			.setURL(externalUrl)
			.addFields([
				{name:"Collection",value:collection},
				{name:"Owner",value:owner},
			])
			if (listed){
				embed.addFields([
					{name:"Price",value:`${price} SOL`},
					{name:"Seller",value:seller},
				])
			}
			const actionRow = GetActionRow("Buy on Magic Eden",`https://magiceden.io/item-details/${address}`)
			await interaction.reply({ embeds: [embed] ,components:[actionRow]});
		} catch (error) {
			console.log(error);
			await showError("Something went wrong", interaction);
		}
	}

	@Slash("floor", {
		description: "get Floor Price of any Collection by providing its symbol",
	})
	async floor(
		@SlashOption("symbol", { description: "symbol of the collection you want to check" })
		symbol: string,
		interaction: CommandInteraction
	): Promise<void> {
		try {
			const result = await Api.getCollectionStats(symbol);

			if (await checkError(result as Error, interaction)) return;
			if (!result.listedCount || !result.floorPrice ||!result.avgPrice24hr || !result.volumeAll) {
				await showError(
					"Symbol must be written wrong!",
					interaction
				);
				return;
			}
			const { floorPrice, listedCount, volumeAll, avgPrice24hr } = result;
			const embed = new MessageEmbed({
				title: `Floor Price of ${symbol}`,
			}).setColor(blueColor)
			.addField("Floor Price", floorPrice.toString() + " SOL")
			.addField("Total Listings", listedCount.toString())
			.addField("24hr Average Price", avgPrice24hr.toString() + " SOL")
			.addField("Total Volume Traded", volumeAll.toString() + " SOL")
			
			const messageRow = GetActionRow("Buy on Magic Eden",`https://magiceden.io/marketplace/${symbol}`);
			await interaction.reply({ embeds: [embed],components: [messageRow] });
		} catch (error) {
			console.log(error);
			await showError("No listings available for this collection.", interaction);
		}
	}

	@Slash("wallet", { description: "get NFTs by Wallet address" })
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
			// const metadata = await Metaplex.getNFTbyWallet(address);
			const response = await BApi.solanaGetNFTsBelongingToWallet({
				wallet: address,
				network: "mainnet-beta",
			});
			console.log(response);
			const err = response as Error;
			const bdata = response as OffChainData[];
			if (await checkError(err, interaction)) return;
			// const links = metadata as string[];
			//start previous next end
			const embedX = new PaginationResolver(
				async (page: number, pagination: any) => {
					let data: OffChainData;
					try {
						// data = await Metaplex.datafromUri(links[page]);
						data = bdata[page];
					} catch (error) {
						console.log(error);
						data = {
							name: "Error Loading",
							description: "please try next one",
							image: default_image,
						};
					}
					console.log(data);
					return new MessageEmbed()
						.setTitle(
							`NFT's for wallet : ${formatAddress(address)}`
						)
						.addField("Name", data.name || "N/A")
						.addField("Description", data.description || "N/A")
						.setImage(data.image || default_image)
						.setFooter({
							text: `NFT ${page + 1} of ${bdata.length}  `,
						})
						.setColor(sidebarColor);
				},
				bdata.length
			);

			const pagination = new Pagination(interaction, embedX, {
				// ephemeral: true,
				onTimeout: () => {
					interaction.editReply("TimedOut");
				},

				time: 5 * 60 * 1000,
				type:
					bdata.length > 10
						? PaginationType.SelectMenu
						: PaginationType.Button,
			});

			await pagination.send();
		} catch (error) {
			console.log(error);
			showError("Error Occured", interaction);
		}
	}

	@Slash("get_collections", {
		description: "Get details of Magic Eden Launchpad Collections",
	})
	async collections(
		@SlashOption("limit", {
			description: "Limit",
			required: false,
			// minValue: 0, maxValue:500
		})
		limit: number,
		@SlashOption("offset", {
			description: "offset",
			required: false,
			//	minValue: 0,	maxValue:500
		})
		offset: number,
		interaction: CommandInteraction
	): Promise<void> {
		offset = offset || 0;
		limit = limit || 20;
		await interaction.deferReply();
		const result = await Api.getCollections(offset, limit);
		if (result.length == 0) {
			const errorEmbed = ErrorEmbed("No collections found");
			await interaction.editReply({ embeds: [errorEmbed] });
			return;
		}
		if (await checkError(result as Error, interaction)) return;
		const cols = result as CollectionResponse[];
		console.log(cols);
		try {
			const pages = cols.map((col, i) => {
				return new MessageEmbed()
					.setFooter({
						text: `Collection ${i + 1} of ${
							offset == 0
								? cols.length
								: `${offset - 1}-${offset + cols.length}`
						}`,
					})
					.setTitle("**Launchpad Collections**")
					.addField("Name", col.name)
					.addField("Symbol", col.symbol)
					.addField("Description", col.description.substring(0, 1000))
					.addField("Price", col.price.toString() + " SOL")
					.addField("Total Supply", col.size.toString())
					.addField("Launch Date", col.launchDatetime || "-")
					.setImage(col.image)
					.setColor(sidebarColor);
			});
			const pagination = new Pagination(interaction, pages, {
				type:
					limit > 10
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

	@Slash("get_collection_listings", {
		description: "Get listing details of a Collection on Magic Eden marketplace",
	})
	async collectionLising(
		@SlashOption("symbol", {
			description: "Collection Symbol",
			required: true,
		})
		symbol: string,
		@SlashOption("limit", {
			description: "Limit",
			required: false,
		})
		limit: number,
		@SlashOption("offset", {
			description: "offset",
			required: false,
		})
		offset: number,
		interaction: CommandInteraction
	): Promise<void> {
		offset = offset || 0;
		limit = limit || 20;
		await interaction.deferReply();
		const result = await Api.getCollectionList(offset, limit, symbol);
		if (result.length == 0) {
			const errorEmbed = ErrorEmbed("No Listings found");
			await interaction.editReply({ embeds: [errorEmbed] });
			return;
		}

		if (await checkError(result as Error, interaction)) return;
		const cols = result as CollectionList[];
		console.log(cols);
		try {
			const pages = cols.map((col, i) => {
				return new MessageEmbed()
					.setFooter({
						text: `Listing ${i + 1} of ${
							offset == 0
								? cols.length
								: `${offset - 1}-${offset + cols.length}`
						}`,
					})
					.setTitle(`**Listings of ${symbol}**`)
					.addField("Mint Address", col.tokenMint)
					.addField("Seller", col.seller)
					.addField("Price", col.price.toString() + " SOL")
					.setColor(blueColor);
			});
			const resolver = new PaginationResolver(
				async(page:number,pagination:Pagination)=>{
					const col = cols[page];
					const token = await Api.getTokens(col.tokenMint);
					return new MessageEmbed()
					.setFooter({
						text: `Listing ${page} of ${
							offset == 0
								? cols.length
								: `${offset - 1}-${offset + cols.length}`
						}`,
					})
					.setTitle(`**Listings of ${symbol}**`)
					.addField("Mint Address", col.tokenMint)
					.addField("Seller", col.seller)
					.addField("Price", col.price.toString() + " SOL")
					.addField(`${token.name} `, `[Buy on Magic Eden](https://magiceden.io/item-details/${col.tokenMint})`)
					.setImage(token.image||default_image)
					.setColor(blueColor)
					
				}	
		,cols.length
			)
			const pagination = new Pagination(interaction, resolver, {
				type:
					limit > 10
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

	@Slash("converter", { description: "convert currencies" })
	async convert(
		@SlashChoice("Currency to Solana","c2s")
		@SlashChoice("Solana to Currency","s2c")
		@SlashOption("method", { description: "method", required: true })
		action: string,
		@SlashOption("amount", { description: "amount", required: true })
		amount: number,
		@SlashChoice(CurrencyChoices)
		@SlashOption("currency", { description: "currency", required: true })
		currency: string,
		interaction: CommandInteraction
	): Promise<void> {
		await interaction.deferReply();
		let data: ConversionResponse;
		let from:string,to:string;
		if(action=="c2s"){
			from=currency;
			to="solana";
		}else{
			from="solana";
			to=currency;
		}
		try {
			const result = await convert(
				amount,
				from.toLowerCase(),
				to.toLowerCase()
			);
			data = result;
			const embed = new MessageEmbed()
				.setTitle(`**${amount} ${from} to ${to}**`)
				.addField(`${from}`, data.initalAmount.toString(), true)
				.addField(`${to}`, data.convertedAmount.toString(), true)
				.setFooter({
					text: `1 SOL ≈ ${
						data.rate
					} ${currency.toUpperCase().substring(0,3)}`,
				})
				.setColor(blueColor);
			await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			console.log(error);
			showError(error + " ", interaction);
		}
	}
}

function GetActionRow(label:string,link: string) {
	const button = new MessageButton({ label: label, url: link, style: "LINK" });

	const messageRow = new MessageActionRow().addComponents(button);
	return messageRow;
}

