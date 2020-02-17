import AppDirectory from 'appdirectory';
import FileManager from 'file-manager';
import * as Events from "events";

import Package from '../package.json';

// TODO Değişecek.
const HandlerManager = require('./components/classes/HandlerManager.js');
const SteamChatRoomClient = require('./components/chatroom.js');

import CurrencyData from "./resources/CurrencyData";
import EClientUIMode from './resources/EClientUIMode';
import EConnectionProtocol from "./resources/EConnectionProtocol";
import EMachineIDType from "./resources/EMachineIDType";
import EPurchaseResult from './resources/EPurchaseResult';
import EPrivacyState from './resources/EPrivacyState';

import DefaultOptions from './resources/default_options';

import './resources/enums';

export interface SteamUserOptions {
	protocol: EConnectionProtocol,
	httpProxy: any|string,
	localAddress: any|string,
	localPort: null|number,
	autoRelogin: boolean,
	singleSentryfile: boolean,
	machineIdType: EMachineIDType,
	machineIdFormat: string[],
	enablePicsCache: boolean,
	picsCacheAll: boolean,
	changelistUpdateInterval: number,
	saveAppTickets: boolean,
	additionalHeaders: object,
	language: string,
	webCompatibilityMode: boolean,
	dataDirectory: null|string
}

export default class SteamUser extends Events.EventEmitter {
	public static CurrencyData = CurrencyData;
	public static EClientUIMode = EClientUIMode;
	public static EConnectionProtocol = EConnectionProtocol;
	public static EMachineIDType = EMachineIDType;
	public static EPurchaseResult = EPurchaseResult;
	public static EPrivacyState = EPrivacyState;

	public static packageName: string = Package.name;
	public static packageVersion: string = Package.version;

	public steamID: null | string;
	public chat: SteamChatRoomClient;
	public storage: FileManager;

	// Account info
	public limitations: null;
	public vac: null;
	public wallet: null;
	public emailInfo: null;
	public licenses: null;
	public gifts: null;

	// Friends and users info
	public users: object;
	public groups: object;
	public chats: object;
	public myFriends: object;
	public myGroups: object;
	public myFriendGroups: object;
	public myNicknames: object;
	public steamServers: object;
	public contentServersReady: boolean;
	public playingState: object;
	public _playingBlocked: boolean;
	public _playingAppIds: Array<any>;

	public _gcTokens: Array<any>; // game connect tokens
	public _connectTime: number;
	public _connectionCount: number;
	public _connectTimeout: number;
	public _authSeqMe: number;
	public _authSeqThem: number;
	public _hSteamPipe: number;
	public _contentServers: Array<any>;
	public _contentServersTimestamp: number;
	public _contentServerTokens: object;
	public _lastNotificationCounts: object;
	public _sessionID: number;
	public _jobs: object;
	public _richPresenceLocalization: object;

	// App and package cache
	public _changelistUpdateTimer: null;
	public picsCache: object;
	public _sentry: null;

	public options: SteamUserOptions;

	public _handlers: object;
	public _handlerManager: HandlerManager;

	constructor(options: Partial<SteamUserOptions>) {
		super();

		this.steamID = null;
		this.chat = new SteamChatRoomClient(options);

		this.limitations = null;
		this.vac = null;
		this.wallet = null;
		this.emailInfo = null;
		this.licenses = null;
		this.gifts = null;

		this.users= {};
		this.groups= {};
		this.chats= {};
		this.myFriends= {};
		this.myGroups= {};
		this.myFriendGroups= {};
		this.myNicknames= {};
		this.steamServers = {};
		this.contentServersReady = false;
		this.playingState = {"blocked": false, "appid": 0};
		this._playingBlocked = false;
		this._playingAppIds = [];

		this._gcTokens = [];
		this._connectTime = 0;
		this._connectionCount = 0;
		this._connectTimeout = 1000;
		this._authSeqMe = 0;
		this._authSeqThem = 0;
		this._hSteamPipe = Math.floor(Math.random() * 1000000) + 1;
		this._contentServers = [];
		this._contentServersTimestamp = 0;
		this._contentServerTokens = {};
		this._lastNotificationCounts = {};
		this._sessionID = 0;
		this._jobs = {};
		this._richPresenceLocalization = {};

		this._changelistUpdateTimer = null;
		this.picsCache = {
			"changenumber": 0,
			"apps": {},
			"packages": {}
		};
		this._sentry = null;

		this.options = {...DefaultOptions, ...options} as SteamUserOptions;

		if (!this.options.dataDirectory && this.options.dataDirectory !== null) {
			if (process.env.OPENSHIFT_DATA_DIR) {
				this.options.dataDirectory = process.env.OPENSHIFT_DATA_DIR + "/node-steamuser";
			} else {
				this.options.dataDirectory = (new AppDirectory({
					"appName": "node-steamuser",
					"appAuthor": "doctormckay"
				})).userData();
			}
		}

		if (this.options.dataDirectory !== null) {
			this.storage = new FileManager(this.options.dataDirectory);
		}

		if (this.options.webCompatibilityMode && this.options.protocol === SteamUser.EConnectionProtocol.TCP) {
			this._warn('webCompatibilityMode is enabled so connection protocol is being forced to WebSocket.');
		}

		this._handlers = {};
		this._handlerManager = new HandlerManager();
	}

	/**
	 * Set a configuration option.
	 * @param optionName Name of option
	 * @param value Value of option
	 */
	setOption( optionName: string, value: any ) {
		this.options[optionName] = value;

		// Handle anything that needs to happen when particular options update
		switch (optionName) {
			case 'dataDirectory':
				if (!this.storage) {
					this.storage = new FileManager(value);
				} else {
					this.storage.directory = value;
				}

				break;

			case 'enablePicsCache':
				this._resetChangelistUpdateTimer();
				this._getLicenseInfo();
				break;

			case 'changelistUpdateInterval':
				this._resetChangelistUpdateTimer();
				break;

			case 'webCompatibilityMode':
			case 'protocol':
				if (
					(optionName == 'webCompatibilityMode' && value && this.options.protocol == SteamUser.EConnectionProtocol.TCP) ||
					(optionName == 'protocol' && value == SteamUser.EConnectionProtocol.TCP && this.options.webCompatibilityMode)
				) {
					this._warn('webCompatibilityMode is enabled so connection protocol is being forced to WebSocket');
				}
				break;
		}
	}

	/**
	 * Set one or more configuration options
	 * @param options Partial options
	 */
	setOptions( options: Partial<SteamUserOptions> ) {
		for (let i in options) {
			this.setOption(i, options[i]);
		}
	}

	_warn( message: string ) {
		process.stderr.write(`[steam-user] Warning: ${message}\n`);
	}
}

require('./components/connection.js');
require('./components/messages.js');
require('./components/filestorage.js');
require('./components/webapi.js');
require('./components/logon.js');
require('./components/sentry.js');
require('./components/web.js');
require('./components/notifications.js');
require('./components/apps.js');
require('./components/appauth.js');
require('./components/account.js');
require('./components/gameservers.js');
require('./components/utility.js');
require('./components/trading.js');
require('./components/friends.js');
require('./components/chat.js');
require('./components/twofactor.js');
require('./components/pubfiles.js');
require('./components/cdn.js');
require('./components/econ.js');
require('./components/store.js');
require('./components/gamecoordinator.js');
