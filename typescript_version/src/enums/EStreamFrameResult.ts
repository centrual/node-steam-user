enum EStreamFrameResult {
	Pending = 0,
	Displayed = 1,
	DroppedNetworkSlow = 2,
	DroppedNetworkLost = 3,
	DroppedDecodeSlow = 4,
	DroppedDecodeCorrupt = 5,
	DroppedLate = 6,
	DroppedReset = 7,
}

export default EStreamFrameResult;
