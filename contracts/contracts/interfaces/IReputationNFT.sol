// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

enum WorkType { Design, Development, Writing, Marketing, Other }

struct Credential {
    address counterparty;
    WorkType workType;
    uint256 paymentTier;
    bool completedOnTime;
    bool hadDispute;
    bool disputeResolvedFairly;
    uint256 contractId;
    uint256 mintedAt;
}

struct ScoreBreakdown {
    uint256 score;
    uint256 totalContracts;
    uint256 onTimeCount;
    uint256 disputeCount;
}

interface IReputationNFT {
    function mintCredential(address to, Credential memory data) external returns (uint256);
    function slashCredential(uint256 tokenId) external;
    function getCredentials(address wallet) external view returns (Credential[] memory);
    function getReputationScore(address wallet) external view returns (ScoreBreakdown memory);
}
