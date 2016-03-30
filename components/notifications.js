var Steam = require('steam-client');
var SteamUser = require('../index.js');
var SteamID = require('steamid');

SteamUser.prototype._requestNotifications = function() {
	this._send(Steam.EMsg.ClientRequestItemAnnouncements, {});
	this._send(Steam.EMsg.ClientRequestCommentNotifications, {});
	this._send(Steam.EMsg.ClientFSRequestOfflineMessageCount, {});
};

// Handlers

SteamUser.prototype._handlers[Steam.EMsg.ClientItemAnnouncements] = function(body) {
	this.emit('newItems', body.count_new_items);
};

SteamUser.prototype._handlers[Steam.EMsg.ClientCommentNotifications] = function(body) {
	this.emit('newComments', body.count_new_comments, body.count_new_comments_owner, body.count_new_comments_subscriptions);
};

SteamUser.prototype._handlers[Steam.EMsg.ClientUserNotifications] = function(body) {
	var self = this;
	(body.notifications || []).forEach(function(notification) {
		if(notification.user_notification_type == 1) {
			self.emit('tradeOffers', notification.count);
		}
	});
};

SteamUser.prototype._handlers[Steam.EMsg.ClientFSOfflineMessageNotification] = function(body) {
	var self = this;
	this.emit('offlineMessages', body.offline_messages, (body.friends_with_offline_messages || []).map(function(accountid) {
		var sid = new SteamID();
		sid.universe = self.steamID.universe;
		sid.type = SteamID.Type.INDIVIDUAL;
		sid.instance = SteamID.Instance.DESKTOP;
		sid.accountid = accountid;
		return sid.toString();
	}));
};

SteamUser.prototype._handlers[Steam.EMsg.ClientMarketingMessageUpdate2] = function(body) {
	var time = body.readUint32();
	var count = body.readUint32();

	var messages = [];

	for (var i = 0; i < count; i++) {
		body.readUint32(); // Dunno what this is. Seems to always be 81.

		messages.push({
			"id": body.readUint64(),
			"url": body.readCString(),
			"flags": body.readUint32()
		});
	}

	this.emit('marketingMessages', new Date(time * 1000), messages);
};
