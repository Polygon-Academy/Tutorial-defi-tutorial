// SPDX-License-Identifier: MIT
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IStdReference.sol";

abstract contract StdReferenceBase is IStdReference {
    function getReferenceData(string memory _base, string memory _quote)
        public
        view
        virtual
        override
        returns (ReferenceData memory);

    function getRefenceDataBulk(string[] memory _bases, string[] memory _quotes)
        public
        view
        override
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

/**
    BTC / USD	8	0x007A22900a3B98143368Bd5906f8E17e9867581b
    ETH / USD	8	0x0715A7794a1dc8e42615F059dD6e406A6594651A
    MATIC / USD	8	0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada
 */
contract StdReferenceChain is StdReferenceBase, Ownable {
    mapping(string => address) private PriceRegister;

    constructor() public {
        PriceRegister["BTC"] = 0x007A22900a3B98143368Bd5906f8E17e9867581b;
        PriceRegister["ETH"] = 0x0715A7794a1dc8e42615F059dD6e406A6594651A;
        PriceRegister["MATIC"] = 0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada;
    }

    function getReferenceData(string memory _base, string memory _quote)
        public
        view
        override
        returns (ReferenceData memory)
    {
        (
            uint80 roundID,
            int256 price,
            uint256 startedAt,
            uint256 timeStamp,
            uint80 answeredInRound
        ) = AggregatorV3Interface(PriceRegister[_base]).latestRoundData();

        return
            ReferenceData({
                rate: uint(price),
                lastUpdatedBase: timeStamp,
                lastUpdatedQuote: timeStamp
            });
    }
}
