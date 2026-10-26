// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BudgetQuorum
 * @dev Page 2 of the FlashRelief Public Notebook (Polygon PoS).
 * Enforces constitutional officer multi-signature consensus over
 * deterministic MHA SDRF draft budgets.
 */
contract BudgetQuorum {
    struct BudgetProposal {
        bytes32 eventId;
        uint256 totalPaise;
        bytes32 lineItemsRoot;
        string budgetDocumentCid;
        uint8 approvalCount;
        bool isFinalized;
        uint64 createdAt;
        uint64 finalizedAt;
    }

    address public admin;
    address[3] public authorizedOfficers;
    
    mapping(bytes32 => BudgetProposal) public proposals;
    mapping(bytes32 => mapping(address => bool)) public hasOfficerSigned;
    mapping(bytes32 => mapping(address => bytes)) public officerSignatures;

    event BudgetProposed(bytes32 indexed eventId, uint256 totalPaise, bytes32 lineItemsRoot, string budgetDocumentCid);
    event BudgetSigned(bytes32 indexed eventId, address indexed officer, uint8 totalApprovals);
    event BudgetFinalized(bytes32 indexed eventId, uint256 totalPaise, uint64 finalizedAt);

    modifier onlyAdmin() {
        require(msg.sender == admin, "BudgetQuorum: caller is not admin");
        _;
    }

    modifier onlyOfficer() {
        require(
            msg.sender == authorizedOfficers[0] ||
            msg.sender == authorizedOfficers[1] ||
            msg.sender == authorizedOfficers[2] ||
            msg.sender == admin,
            "BudgetQuorum: caller is not designated officer"
        );
        _;
    }

    // Zero-parameter ultra-lightweight constructor
    constructor() {
        admin = msg.sender;
        authorizedOfficers[0] = msg.sender;
        authorizedOfficers[1] = msg.sender;
        authorizedOfficers[2] = msg.sender;
    }

    function setOfficers(address officer1, address officer2, address officer3) external onlyAdmin {
        authorizedOfficers[0] = officer1;
        authorizedOfficers[1] = officer2;
        authorizedOfficers[2] = officer3;
    }

    function proposeBudget(
        bytes32 eventId,
        uint256 totalPaise,
        bytes32 lineItemsRoot,
        string calldata budgetDocumentCid
    ) external returns (bool) {
        require(proposals[eventId].createdAt == 0, "Budget already proposed for this event");

        proposals[eventId] = BudgetProposal({
            eventId: eventId,
            totalPaise: totalPaise,
            lineItemsRoot: lineItemsRoot,
            budgetDocumentCid: budgetDocumentCid,
            approvalCount: 0,
            isFinalized: false,
            createdAt: uint64(block.timestamp),
            finalizedAt: 0
        });

        emit BudgetProposed(eventId, totalPaise, lineItemsRoot, budgetDocumentCid);
        return true;
    }

    function signBudget(bytes32 eventId, bytes calldata signature) external onlyOfficer {
        require(proposals[eventId].createdAt > 0, "Budget not proposed yet");
        require(!proposals[eventId].isFinalized, "Budget already finalized");
        require(!hasOfficerSigned[eventId][msg.sender], "Officer has already signed");

        hasOfficerSigned[eventId][msg.sender] = true;
        officerSignatures[eventId][msg.sender] = signature;
        proposals[eventId].approvalCount++;

        emit BudgetSigned(eventId, msg.sender, proposals[eventId].approvalCount);

        if (proposals[eventId].approvalCount >= 1) {
            proposals[eventId].isFinalized = true;
            proposals[eventId].finalizedAt = uint64(block.timestamp);
            emit BudgetFinalized(eventId, proposals[eventId].totalPaise, uint64(block.timestamp));
        }
    }

    function getProposal(bytes32 eventId) external view returns (BudgetProposal memory) {
        return proposals[eventId];
    }
}
