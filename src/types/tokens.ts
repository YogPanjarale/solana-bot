
export interface TokensResponse {
    status?: number;
    message?: string;
    mintAddress: string
    owner: string
    supply: number
    collection: string
    name: string
    updateAuthority: string
    primarySaleHappened: number
    sellerFeeBasisPoints: number
    image: string
    animationUrl: string
    externalUrl: string
    attributes: Attribute[]
    properties: Properties
    errors?: Error[]
  }


  export interface Error {
    value: string
    msg: string
    param: string
    location: string
  }
  
  
  export interface Attribute {
    trait_type: string
    value: string
  }
  
  export interface Properties {
    files: File[]
    category: string
    creators: Creator[]
  }
  
  export interface File {
    uri: string
    type: string
  }
  
  export interface Creator {
    address: string
    share: number
  }
  