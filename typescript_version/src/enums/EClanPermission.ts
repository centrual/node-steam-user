enum EClanPermission {
	Nobody = 0,
	Owner = 1,
	Officer = 2,
	OwnerAndOfficer = 3,
	Member = 4,
	Moderator = 8,
	OGGGameOwner = 16,
	NonMember = 128,
	OwnerOfficerModerator = 11,
	AllMembers = 15,
}

export default EClanPermission;
