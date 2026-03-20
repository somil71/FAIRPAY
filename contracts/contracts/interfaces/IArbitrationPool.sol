// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

struct ArbitratorDetails {
    uint256 reputationTokenId;
    string[] specialties;
    uint256 activeCases;
    uint256 slashHistory;
    bool isActive;
}

interface IArbitrationPool {
    function register(uint256 reputationTokenId, string[] calldata specialties) external;
    function assignArbitrator(uint256 contractId) external returns (address);
    function slashArbitrator(uint256 tokenId) external;
    function getArbitratorDetails(address arb) external view returns (ArbitratorDetails memory);
}
