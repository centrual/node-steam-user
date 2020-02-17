enum EChatPermission {
	Close = 1,
	Invite = 2,
	Talk = 8,
	Kick = 16,
	Mute = 32,
	SetMetadata = 64,
	ChangePermissions = 128,
	Ban = 256,
	ChangeAccess = 512,
	Mask = 1019,
	EveryoneNotInClanDefault = 8,
	EveryoneDefault = 10,
	MemberDefault = 282,
	OfficerDefault = 282,
	OwnerDefault = 891,
}

export default EChatPermission;
