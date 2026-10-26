// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title GrievanceSLA
 * @dev Page 5 of the FlashRelief Public Notebook (Polygon PoS).
 * Immutably anchors citizen relief complaints with a tamper-proof 48-hour
 * statutory SLA countdown clock. Officers cannot delete or modify tickets.
 */
contract GrievanceSLA {
    enum Category { RATION, SHELTER, MEDICAL, INFRA, GENERAL }

    struct GrievanceEntry {
        bytes32 trackingId;       // e.g. keccak256("GRV-2026-081")
        bytes32 citizenHash;      // keccak256(phone + salt) for privacy protection
        Category category;
        string village;
        bytes32 issueHash;        // Hash of citizen statement & GPS location
        uint64 filedAt;           // Block timestamp when clock starts
        uint64 slaDeadline;       // filedAt + 48 hours
        bool isResolved;
        uint64 resolvedAt;
        string resolutionNotes;
        string evidenceCid;       // IPFS CID of officer corrective action proof
    }

    address public admin;
    address public metaRelayer;
    
    mapping(bytes32 => GrievanceEntry) public grievances;
    bytes32[] public allTrackingIds;

    event GrievanceFiled(
        bytes32 indexed trackingId,
        bytes32 indexed citizenHash,
        Category category,
        string village,
        uint64 filedAt,
        uint64 slaDeadline
    );

    event GrievanceResolved(
        bytes32 indexed trackingId,
        uint64 resolvedAt,
        string resolutionNotes,
        string evidenceCid
    );

    event SLABreached(bytes32 indexed trackingId, uint64 deadline, uint64 currentTime);

    modifier onlyRelayerOrAdmin() {
        require(msg.sender == metaRelayer || msg.sender == admin, "GrievanceSLA: caller is not authorized relayer");
        _;
    }

    constructor(address _relayer) {
        admin = msg.sender;
        metaRelayer = _relayer;
    }

    function fileGrievance(
        bytes32 trackingId,
        bytes32 citizenHash,
        Category category,
        string calldata village,
        bytes32 issueHash
    ) external onlyRelayerOrAdmin {
        require(grievances[trackingId].filedAt == 0, "Grievance already exists");

        uint64 filedAt = uint64(block.timestamp);
        uint64 deadline = filedAt + 48 hours; // Statutory 48-Hour SLA

        grievances[trackingId] = GrievanceEntry({
            trackingId: trackingId,
            citizenHash: citizenHash,
            category: category,
            village: village,
            issueHash: issueHash,
            filedAt: filedAt,
            slaDeadline: deadline,
            isResolved: false,
            resolvedAt: 0,
            resolutionNotes: "",
            evidenceCid: ""
        });

        allTrackingIds.push(trackingId);

        emit GrievanceFiled(trackingId, citizenHash, category, village, filedAt, deadline);
    }

    function resolveGrievance(
        bytes32 trackingId,
        string calldata notes,
        string calldata evidenceCid
    ) external {
        GrievanceEntry storage g = grievances[trackingId];
        require(g.filedAt > 0, "Grievance not found");
        require(!g.isResolved, "Already resolved");

        g.isResolved = true;
        g.resolvedAt = uint64(block.timestamp);
        g.resolutionNotes = notes;
        g.evidenceCid = evidenceCid;

        emit GrievanceResolved(trackingId, g.resolvedAt, notes, evidenceCid);
    }

    function isBreached(bytes32 trackingId) external view returns (bool) {
        GrievanceEntry storage g = grievances[trackingId];
        if (g.filedAt == 0 || g.isResolved) return false;
        return block.timestamp > g.slaDeadline;
    }

    function totalGrievancesCount() external view returns (uint256) {
        return allTrackingIds.length;
    }
}
