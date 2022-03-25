export interface Root {
    nfts_metadata: NftsMetadaum[];
    nfts_owned: string[];
}

export interface NftsMetadaum {
    data: Data;
    explorer_url: string;
    is_mutable: boolean;
    mint: string;
    off_chain_data: OffChainData;
    primary_sale_happened: boolean;
    update_authority: string;
}

export interface Data {
    creators: string[];
    name: string;
    seller_fee_basis_points: number;
    share: number[];
    symbol: string;
    uri: string;
    verified: number[];
}

export interface OffChainData {
    attributes?: Attribute[];
    background_color?: string;
    description?: string;
    edition?: string;
    external_url?: string;
    image?: string;
    name?: string;
    properties?: Properties;
    seller_fee_basis_points?: number;
    symbol?: string;
    collection?: Collection;
    id?: string;
}

export interface Attribute {
    trait_type: string;
    value: any;
    display_type?: string;
}

export interface Properties {
    category: string;
    creators: Creator[];
    files: File[];
    collection?: string;
    royalty?: number;
    symbol?: string;
}

export interface Creator {
    address: string;
    share: number;
}

export interface File {
    type: string;
    uri: string;
}

export interface Collection {
    family: string;
    name: string;
}
