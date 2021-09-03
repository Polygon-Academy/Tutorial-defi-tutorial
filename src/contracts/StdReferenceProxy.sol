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

contract StdReferenceProxy is Ownable, StdReferenceBase {
    IStdReference public ref;

    constructor(IStdReference _ref) public {
        ref = _ref;
    }

    /// Updates standard reference implementation. Only callable by the owner.
    function setRef(IStdReference _ref) public onlyOwner {
        ref = _ref;
    }

    /// Returns the price data for the given base/quote pair. Revert if not available.
    function getReferenceData(string memory _base, string memory _quote)
        public
        override
        view
        returns (ReferenceData memory)
    {
        return ref.getReferenceData(_base, _quote);
    }
}