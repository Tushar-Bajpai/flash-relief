// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title BudgetQuorum
 * @dev Page 2 of the FlashRelief Public Notebook (Polygon PoS).
 * Enforces 3-of-3 constitutional officer multi-signature consensus
 * over deterministic MHA SDRF draft budgets.
 */
contract BudgetQuorum {
    struct OfficerProfile {
        address wallet;
        string name;
        string cadre; // "IAS" | "NDMA" | "IDAS"
        string role;
        bool isRegistered;
    }

    struct BudgetProposal {
        bytes32 eventId;
        uint256 totalPaise;         // In integer paise (e.g. ₹7.35 Cr = 7,35,00,000 * 100 paise)
        bytes32 lineItemsRoot;      // Merkle root of all MHA SDRF itemized norms
        string budgetDocumentCid;  // IPFS CID of full audit specification
        uint8 approvalCount;
        bool isFinalized;
        uint64 createdAt;
        uint64 finalizedAt;
    }

    address public admin;
    mapping(address => OfficerProfile) public officers;
    address[3] public authorizedOfficers;
    
    mapping(bytes32 => BudgetProposal) public proposals;
    mapping(bytes32 => mapping(address => bool)) public hasOfficerSigned;
    mapping(bytes32 => mapping(address => bytes)) public officerSignatures;

    event OfficerRegistered(address indexed wallet, string name, string cadre, string role);
    event BudgetProposed(bytes32 indexed eventId, uint256 totalPaise, bytes32 lineItemsRoot, string budgetDocumentCid);
    event BudgetSigned(bytes32 indexed eventId, address indexed officer, string cadre, uint8 totalApprovals);
    event BudgetFinalized(bytes32 indexed eventId, uint256 totalPaise, uint64 finalizedAt);

    modifier onlyAdmin() {
        require(msg.sender == admin, "BudgetQuorum: caller is not admin");
        _;
    }

    modifier onlyDesignatedOfficer() {
        require(officers[msg.sender].isRegistered, "BudgetQuorum: caller is not a designated officer");
        _;
    }

    constructor(
        address dmIas,
        address ndmaAdvisor,
        address idasFinance
    ) {
        admin = msg.sender;
        
        authorizedOfficers[0] = dmIas;
        authorizedOfficers[1] = ndmaAdvisor;
        authorizedOfficers[2] = idasFinance;

        officers[dmIas] = OfficerProfile(dmIas, "Shri Pulak Mahanta", "IAS", "District Magistrate & DC", true);
        officers[ndmaAdvisor] = OfficerProfile(ndmaAdvisor, "Dr. Sanjeev Kakoty", "NDMA", "Chief Hydrological Advisor", true);
        officers[idasFinance] = OfficerProfile(idasFinance, "Smt. Mridula Baruah", "IDAS", "Joint Secretary (Finance)", true);
    }

    /**
     * @notice Registers a new deterministic budget proposal formulated from Stage 02.
     */
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

    /**
     * @notice Officer signs the budget package with their private key.
     */
    function signBudget(bytes32 eventId, bytes calldata signature) external onlyDesignatedOfficer {
        BudgetProposal storage prop = proposals[eventId];
        require(prop.createdAt > 0, "Budget not found");
        require(!prop.isFinalized, "Budget already finalized");
        require(!hasOfficerSigned[eventId][msg.sender], "Officer already signed this proposal");

        hasOfficerSigned[eventId][msg.sender] = true;
        officerSignatures[eventId][msg.sender] = signature;
        prop.approvalCount += 1;

        emit BudgetSigned(eventId, msg.sender, officers[msg.sender].cadre, prop.approvalCount);

        // 3-of-3 Quorum condition check
        if (prop.approvalCount >= 3) {
            prop.isFinalized = true;
            prop.finalizedAt = uint64(block.timestamp);
            emit BudgetFinalized(eventId, prop.totalPaise, prop.finalizedAt);
        }
    }

    function isQuorumAchieved(bytes32 eventId) external view returns (bool) {
        return proposals[eventId].isFinalized;
    }
}
