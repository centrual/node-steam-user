enum EClientPersonaStateFlag {
	Status = 1,
	PlayerName = 2,
	QueryPort = 4,
	SourceID = 8,
	Presence = 16,
	Metadata = 32,
	LastSeen = 64,
	ClanInfo = 128,
	GameExtraInfo = 256,
	GameDataBlob = 512,
	ClanTag = 1024,
	Facebook = 2048,
}

export default EClientPersonaStateFlag;
