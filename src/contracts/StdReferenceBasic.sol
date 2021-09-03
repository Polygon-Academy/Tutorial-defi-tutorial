// SPDX-License-Identifier: Apache-2.0

pragma solidity 0.6.11;
pragma experimental ABIEncoderV2;


import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IStdReference.sol";



abstract contract StdReferenceBase is IStdReference {
    function getReferenceData(string memory _base, string memory _quote)
        public
        virtual
        override
        view
        returns (ReferenceData memory);

    function getRefenceDataBulk(string[] memory _bases, string[] memory _quotes)
        public
        override
        view
        returns (ReferenceData[] memory)
    {
        require(_bases.length == _quotes.length, "BAD_INPUT_LENGTH");
        uint256 len = _bases.length;
        ReferenceData[] memory results = new ReferenceData[](len);
        for (uint256 idx = 0; idx < len; idx++) {
            results[idx] = getReferenceData(_bases[idx], _quotes[idx]);
        }
        return results;
    }
}

contract StdReferenceBasic is Ownable, StdReferenceBase {
    event RefDataUpdate(string symbol, uint64 rate, uint64 lastUpdate);
    
    struct RefData {
        uint64 rate; // USD-rate, multiplied by 1e9.
        uint64 lastUpdate; // UNIX epoch when data is last updated.
    }

    mapping(string => RefData) public refs; // Mapping from symbol to ref data.

    function relay(
        string[] memory _symbols,
        uint64[] memory _rates,
        uint64[] memory _resolveTimes
    ) external onlyOwner {
        uint256 len = _symbols.length;
        require(_rates.length == len, "BAD_RATES_LENGTH");
        require(_resolveTimes.length == len, "BAD_RESOLVE_TIMES_LENGTH");
        for (uint256 idx = 0; idx < len; idx++) {
            refs[_symbols[idx]] = RefData({
                rate: _rates[idx],
                lastUpdate: _resolveTimes[idx]
            });
            emit RefDataUpdate(_symbols[idx], _rates[idx], _resolveTimes[idx]);
        }
    }

    function getReferenceData(string memory _base, string memory _quote)
        public
        override
        view
        returns (ReferenceData memory)
    {
        (uint256 baseRate, uint256 baseLastUpdate) = _getRefData(_base);
        (uint256 quoteRate, uint256 quoteLastUpdate) = _getRefData(_quote);
        return
            ReferenceData({
                rate: (baseRate * 1e18) / quoteRate,
                lastUpdatedBase: baseLastUpdate,
                lastUpdatedQuote: quoteLastUpdate
            });
    }

    function _getRefData(string memory _symbol)
        internal
        view
        returns (uint256 rate, uint256 lastUpdate)
    {
        if (keccak256(bytes(_symbol)) == keccak256(bytes("USD"))) {
            return (1e9, now);
        }
        RefData storage refData = refs[_symbol];
        require(refData.lastUpdate > 0, "REF_DATA_NOT_AVAILABLE");
        return (uint256(refData.rate), uint256(refData.lastUpdate));
    }
}