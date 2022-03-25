export function formatAddress(address:string) {
    if (address.length >=10) {
        return address.substring(0,4) + "..." + address.substring(address.length-4, address.length);
    }
}