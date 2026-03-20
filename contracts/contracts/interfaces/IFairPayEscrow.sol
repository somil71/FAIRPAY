// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

enum ContractStatus { Active, Completed, Cancelled, Disputed }
enum MilestoneStatus {
    Pending,
    Submitted,
    InDispute,
    PartialDispute,
    Released,
    Refunded,
    PartialRelease
}
enum VerificationMethod { MultiSig, GitHubCommit, IPFSHash }

struct DisputeResolution {
    uint256 freelancerBps;
    bool arbitratorSigned;
    bool clientAcknowledged;
    bool freelancerAcknowledged;
    uint256 signatureDeadline;
}

struct Milestone {
    string title;
    string description;
    uint256 paymentBps;
    uint256 deadline;
    MilestoneStatus status;
    VerificationMethod verificationMethod;
    bytes32 expectedHash;
    bytes32 submittedHash;
    uint256 submittedAt;
    uint256 disputedBps;
    address arbitrator;
    DisputeResolution resolution;
}

struct EscrowContract {
    address client;
    address freelancer;
    address paymentToken;
    uint256 totalAmount;
    uint256 releasedAmount;
    ContractStatus status;
    string githubRepo;
    string ipfsBriefCID;
    uint256 createdAt;
    uint256 disputeBond;
    bool retainerMode;
    Milestone[] milestones;
}

interface IFairPayEscrow {
    function createContract(
        address freelancer,
        address paymentToken,
        uint256 totalAmount,
        string calldata githubRepo,
        string calldata ipfsBriefCID,
        uint256 disputeBond,
        Milestone[] calldata _milestones
    ) external payable returns (uint256);

    function submitMilestone(uint256 contractId, uint256 milestoneIndex, bytes32 deliverableHash) external;
    function approveAndRelease(uint256 contractId, uint256 milestoneIndex) external;
    function releaseByDefault(uint256 contractId, uint256 milestoneIndex) external;
    function raiseDispute(uint256 contractId, uint256 milestoneIndex, uint256 disputedBps) external payable;
    function resolveDispute(uint256 contractId, uint256 milestoneIndex, uint256 freelancerBps) external;
    function autoVerifyMilestone(uint256 contractId, uint256 milestoneIndex, bytes32 commitHash) external;
    function cancelContract(uint256 contractId) external;
    function getContract(uint256 contractId) external view returns (EscrowContract memory);
    function getMilestone(uint256 contractId, uint256 milestoneIndex) external view returns (Milestone memory);
    function getAllContracts(address party) external view returns (uint256[] memory);
}
