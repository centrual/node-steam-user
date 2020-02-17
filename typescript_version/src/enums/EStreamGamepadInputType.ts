enum EStreamGamepadInputType {
	Invalid = 0,
	DPadUp = 1,
	DPadDown = 2,
	DPadLeft = 4,
	DPadRight = 8,
	Start = 16,
	Back = 32,
	LeftThumb = 64,
	RightThumb = 128,
	LeftShoulder = 256,
	RightShoulder = 512,
	Guide = 1024,
	A = 4096,
	B = 8192,
	X = 16384,
	Y = 32768,
	LeftThumbX = 65536,
	LeftThumbY = 131072,
	RightThumbX = 262144,
	RightThumbY = 524288,
	LeftTrigger = 1048576,
	RightTrigger = 2097152,
}

export default EStreamGamepadInputType;