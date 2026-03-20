// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IFairPayEscrow.sol";

contract TemplateRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;

    struct Template {
        string name;
        string description;
        string[] milestoneNames;
        uint256[] paymentBps;
        string[] deliverableDescriptions;
        VerificationMethod[] verificationMethods;
        bool active;
    }

    Template[] public templates;

    event TemplateAdded(uint256 indexed templateId, string name);
    event TemplateUpdated(uint256 indexed templateId, bool active);

    constructor() {
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function addTemplate(Template memory t) external onlyRole(ADMIN_ROLE) returns (uint256) {
        templates.push(t);
        uint256 id = templates.length - 1;
        emit TemplateAdded(id, t.name);
        return id;
    }
    
    function setTemplateStatus(uint256 templateId, bool status) external onlyRole(ADMIN_ROLE) {
        require(templateId < templates.length, "Invalid templateId");
        templates[templateId].active = status;
        emit TemplateUpdated(templateId, status);
    }

    function getTemplate(uint256 templateId) external view returns (Template memory) {
        require(templateId < templates.length, "Invalid template");
        return templates[templateId];
    }

    function listTemplates() external view returns (Template[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < templates.length; i++) {
            if (templates[i].active) activeCount++;
        }
        
        Template[] memory activeTemplates = new Template[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < templates.length; i++) {
            if (templates[i].active) {
                activeTemplates[index] = templates[i];
                index++;
            }
        }
        return activeTemplates;
    }
}
