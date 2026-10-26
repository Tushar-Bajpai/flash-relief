// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DetectionRegistry
 * @dev Page 1 of the FlashRelief Public Notebook (Polygon PoS).
 * Records automated sensor ingest fingerprints to indisputably prove
 * detection lead-time before news media broadcasts.
 */
contract DetectionRegistry {
    enum AlertLevel { CLEAR, WATCH, WARNING, CONFIRMED }

    struct DetectionRecord {
        bytes32 eventId;          // e.g. keccak256("fl-2026-brahmaputra")
        AlertLevel alertLevel;    // CLEAR, WATCH, WARNING, CONFIRMED
        uint16 probabilityBasis;  // Basis points (e.g. 9100 = 91.00%)
        uint32 leadTimeSeconds;   // Lead time before river crest (e.g. 41040 = 11.4h)
        bytes32 telemetryHash;    // keccak256(GPM_rain + CWC_gauge + GloFAS_discharge)
        string satelliteMaskCid;  // IPFS CID of Sentinel-1 SAR flood GeoTIFF
        uint64 timestamp;         // Polygon block timestamp
        address oracleSigner;     // Whitelisted AI detection oracle
    }

    address public admin;
    mapping(address => bool) public authorizedOracles;
    mapping(bytes32 => DetectionRecord[]) public eventDetections;
    bytes32[] public recordedEventIds;

    event FloodAlertNotarized(
        bytes32 indexed eventId,
        AlertLevel alertLevel,
        uint16 probabilityBasis,
        uint32 leadTimeSeconds,
        bytes32 telemetryHash,
        string satelliteMaskCid,
        uint64 timestamp,
        address indexed oracleSigner
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "DetectionRegistry: caller is not admin");
        _;
    }

    modifier onlyOracle() {
        require(authorizedOracles[msg.sender] || msg.sender == admin, "DetectionRegistry: caller is not authorized oracle");
        _;
    }

    constructor() {
        admin = msg.sender;
        authorizedOracles[msg.sender] = true;
    }

    function setOracle(address oracle, bool authorized) external onlyAdmin {
        authorizedOracles[oracle] = authorized;
    }

    /**
     * @notice Stamped alert fingerprint to the Polygon Public Notebook.
     */
    function recordDetection(
        bytes32 eventId,
        AlertLevel alertLevel,
        uint16 probabilityBasis,
        uint32 leadTimeSeconds,
        bytes32 telemetryHash,
        string calldata satelliteMaskCid
    ) external onlyOracle returns (bytes32 recordFingerprint) {
        DetectionRecord memory record = DetectionRecord({
            eventId: eventId,
            alertLevel: alertLevel,
            probabilityBasis: probabilityBasis,
            leadTimeSeconds: leadTimeSeconds,
            telemetryHash: telemetryHash,
            satelliteMaskCid: satelliteMaskCid,
            timestamp: uint64(block.timestamp),
            oracleSigner: msg.sender
        });

        if (eventDetections[eventId].length == 0) {
            recordedEventIds.push(eventId);
        }
        eventDetections[eventId].push(record);

        recordFingerprint = keccak256(abi.encode(record, block.number));

        emit FloodAlertNotarized(
            eventId,
            alertLevel,
            probabilityBasis,
            leadTimeSeconds,
            telemetryHash,
            satelliteMaskCid,
            uint64(block.timestamp),
            msg.sender
        );
    }

    function getDetectionCount(bytes32 eventId) external view returns (uint256) {
        return eventDetections[eventId].length;
    }

    function getDetection(bytes32 eventId, uint256 index) external view returns (DetectionRecord memory) {
        require(index < eventDetections[eventId].length, "Index out of range");
        return eventDetections[eventId][index];
    }
}
