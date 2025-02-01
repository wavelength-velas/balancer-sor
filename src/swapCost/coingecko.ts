import fetch from 'isomorphic-fetch';

const getPlatformId = (chainId: string | number): string => {
    const mapping = {
        '1': 'ethereum',
        '42': 'ethereum',
        '137': 'polygon-pos',
        '43113': 'avalanche',
        '43114': 'avalanche',
        '106': 'velas',
        '2741': 'abstract',
    };

    return mapping[chainId.toString()] || 'ethereum';
};

const getNativeAssetId = (chainId: string | number): string => {
    const mapping = {
        '1': 'eth',
        '42': 'eth',
        // CoinGecko does not provide prices in terms of MATIC
        // TODO: convert through ETH as intermediary
        '137': '',
        '42161': 'eth',
        '43113': 'avalanche-2',
        '43114': 'avalanche-2',
        '106': 'velas',
        '2741': 'eth',
    };

    return mapping[chainId.toString()] || 'eth';
};

/**
 * @dev Assumes that the native asset has 18 decimals
 * @param chainId - the chain id on which the token is deployed
 * @param tokenAddress - the address of the token contract
 * @param tokenDecimals - the number of decimals places which the token is divisible by
 * @returns the price of 1 ETH in terms of the token base units
 */
export async function getTokenPriceInNativeAsset(
    chainId: number,
    tokenAddress: string
): Promise<string> {
    const platformId = getPlatformId(chainId);
    const nativeAssetId = getNativeAssetId(chainId);
    const endpoint = `https://api.coingecko.com/api/v3/simple/token_price/${platformId}?contract_addresses=${tokenAddress}&vs_currencies=${nativeAssetId}`;

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();

    if (data[tokenAddress.toLowerCase()][nativeAssetId] === undefined)
        throw Error('No price returned from Coingecko');

    return data[tokenAddress.toLowerCase()][nativeAssetId];
}
