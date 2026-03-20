// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IReputationNFT.sol";

contract ReputationNFT is ERC721, AccessControl, IReputationNFT {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");
    
    uint256 private _nextTokenId;
    
    mapping(uint256 => Credential) public credentials;
    mapping(address => uint256[]) private userTokens;

    event CredentialMinted(uint256 indexed tokenId, address indexed to, WorkType workType, uint256 paymentTier);
    event CredentialSlashed(uint256 indexed tokenId);

    constructor(address arbitrationPool) ERC721("FairPay Reputation", "FPREP") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        if (arbitrationPool != address(0)) {
            _grantRole(ARBITRATOR_ROLE, arbitrationPool);
        }
    }
    
    function setArbitrationPool(address pool) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(ARBITRATOR_ROLE, pool);
    }

    function mintCredential(address to, Credential memory data) external onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        data.mintedAt = block.timestamp;
        credentials[tokenId] = data;
        userTokens[to].push(tokenId);
        
        _safeMint(to, tokenId);
        
        emit CredentialMinted(tokenId, to, data.workType, data.paymentTier);
        return tokenId;
    }

    function slashCredential(uint256 tokenId) external onlyRole(ARBITRATOR_ROLE) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        credentials[tokenId].disputeResolvedFairly = false;
        credentials[tokenId].hadDispute = true;
        emit CredentialSlashed(tokenId);
    }

    function getCredentials(address wallet) external view returns (Credential[] memory) {
        uint256[] memory tokenIds = userTokens[wallet];
        Credential[] memory creds = new Credential[](tokenIds.length);
        for(uint256 i = 0; i < tokenIds.length; i++) {
            creds[i] = credentials[tokenIds[i]];
        }
        return creds;
    }

    function getReputationScore(address wallet) external view returns (ScoreBreakdown memory) {
        uint256[] memory tokenIds = userTokens[wallet];
        uint256 total = tokenIds.length;
        uint256 onTime = 0;
        uint256 disputes = 0;

        for(uint256 i = 0; i < total; i++) {
            Credential memory c = credentials[tokenIds[i]];
            if (c.completedOnTime) onTime++;
            if (c.hadDispute && !c.disputeResolvedFairly) disputes++;
        }

        uint256 volumeBonus = total * 10;
        if (volumeBonus > 40) volumeBonus = 40;
        
        uint256 score = 60 + volumeBonus;
        
        uint256 timeBonus = onTime;
        if (timeBonus > 20) timeBonus = 20;
        score += timeBonus;
        
        uint256 penalty = disputes * 5;
        if (penalty > score) {
            score = 0;
        } else {
            score -= penalty;
        }
        
        if (score > 100) score = 100;

        return ScoreBreakdown({
            score: score,
            totalContracts: total,
            onTimeCount: onTime,
            disputeCount: disputes
        });
    }

    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "ReputationNFT: Soulbound tokens cannot be transferred");
        return super._update(to, tokenId, auth);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
