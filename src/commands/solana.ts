import {
	Pagination,
	PaginationResolver,
	PaginationType,
} from "@discordx/pagination";
import {
	CommandInteraction,
	MessageEmbed,
} from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import { CollectionResponse,Data,Error } from "../types";

import { MagicDen } from "../services/MagicDen.js";
import { Metaplex } from "../services/Metaplex.js";
import { default_image } from "../config.js";


const Api = new MagicDen();

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
			const metadata = await Metaplex.getNFTbyWallet(address);
			console.log(metadata);
			const err = metadata as Error;
			if (await checkError(err, interaction)) return;
			const links = metadata as string[];
			//start previous next end
			const embedX = new PaginationResolver(
				async (page: number, pagination: any) => {
					let data: Data;
					try {
						data = await Metaplex.datafromUri(links[page]);
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
					.addField("Description", col.description.substring(0, 1000))
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
