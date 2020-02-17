enum ERemoteDeviceStreamingResult {
	Success = 0,
	Unauthorized = 1,
	ScreenLocked = 2,
	Failed = 3,
	Busy = 4,
	InProgress = 5,
	Canceled = 6,
	DriversNotInstalled = 7,
	Disabled = 8,
	BroadcastingActive = 9,
	VRActive = 10,
	PINRequired = 11,
}

export default ERemoteDeviceStreamingResult;
