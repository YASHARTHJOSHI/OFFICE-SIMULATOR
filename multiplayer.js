/**
 * Corporate Ladder - Multiplayer Engine
 * Dual-Transport Networking: WebRTC (PeerJS) + Local BroadcastChannel
 * Supports room creation/joining, unique character lock, synchronized positions,
 * animations, room transitions, and live player badges.
 */

class MultiplayerEngine {
  constructor() {
    this.active = false;
    this.isHost = false;
    this.roomCode = null;
    this.peer = null;
    this.peerId = null;
    this.bc = null; // BroadcastChannel for local/multi-tab instantaneous sync
    this.connections = new Map();
    this.peers = new Map(); // id -> player state

    this.localPlayer = {
      id: 'p_' + Math.random().toString(36).substring(2, 9),
      name: 'Player',
      charId: null,
      x: 512,
      y: 245,
      direction: 'down',
      isMoving: false,
      animFrame: 0,
      scene: 'OFFICE_HALL',
      isReady: false
    };

    // 4-Player Character Hierarchy
    this.characters = [
      {
        id: 'char1',
        name: 'Vikram',
        role: 'Tech Lead / Specialist',
        desc: 'Glasses, black jacket & badge. Swift problem-solver.',
        avatar: 'assets/char1_avatar.png',
        idleSprite: 'assets/char1_idle.png',
        spritesheet: 'assets/char1_spritesheet.png',
        available: true,
        claimedBy: null,
        claimedByName: null
      },
      {
        id: 'char2',
        name: 'Neha',
        role: 'Strategic Planner',
        desc: 'Plaid overshirt & pink cargo pants. Dynamic communicator.',
        avatar: 'assets/char2_avatar.png',
        idleSprite: 'assets/char2_idle.png',
        spritesheet: 'assets/char2_spritesheet.png',
        available: true,
        claimedBy: null,
        claimedByName: null
      },
      {
        id: 'char3',
        name: 'Kabir',
        role: 'Executive Director',
        desc: 'Corner suite veteran. Coming soon in next team update!',
        avatar: 'assets/player_portrait.png',
        idleSprite: null,
        spritesheet: null,
        available: false,
        claimedBy: null,
        claimedByName: null,
        isLocked: true
      },
      {
        id: 'char4',
        name: 'Riya',
        role: 'Operations Analyst',
        desc: 'Workflow optimizer. Coming soon in next team update!',
        avatar: 'assets/partner_portrait.png',
        idleSprite: null,
        spritesheet: null,
        available: false,
        claimedBy: null,
        claimedByName: null,
        isLocked: true
      }
    ];

    this.lastBroadcastTime = 0;
    this.broadcastIntervalMs = 33; // ~30 fps state broadcast
    this.onLobbyUpdate = null;
    this.onToast = null;
  }

  // Generate a random clean room code (e.g. OFF-8392)
  static generateRoomCode() {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `OFF-${num}`;
  }

  /**
   * Start or Join a Multiplayer Session
   */
  startSession(roomCode, playerName, isHost = false) {
    this.active = true;
    this.roomCode = roomCode.toUpperCase().trim();
    this.isHost = isHost;
    this.localPlayer.name = playerName.trim() || (isHost ? 'Host' : 'Colleague');
    this.peers.clear();
    this.resetCharacterClaims();

    // 1. Setup Local BroadcastChannel (instant zero-latency multi-tab sync)
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        if (this.bc) this.bc.close();
        this.bc = new BroadcastChannel(`office_sim_room_${this.roomCode}`);
        this.bc.onmessage = (event) => this.handleIncomingMessage(event.data);
      }
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }

    // 2. Setup WebRTC PeerJS
    this.initPeerJS();

    // 3. Announce local presence
    this.broadcast({
      type: 'JOIN',
      senderId: this.localPlayer.id,
      player: this.localPlayer
    });

    if (this.onLobbyUpdate) this.onLobbyUpdate();
  }

  initPeerJS() {
    if (typeof Peer === 'undefined') {
      console.warn('PeerJS library not loaded; operating on BroadcastChannel.');
      return;
    }

    const cleanRoom = this.roomCode.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
    const peerPrefix = `officesim-${cleanRoom}`;
    const myId = `${peerPrefix}-${this.localPlayer.id}`;

    try {
      this.peer = new Peer(myId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        this.peerId = id;
        console.log('[Multiplayer] PeerJS connected with ID:', id);

        // If not host, attempt connection to host ID convention
        if (!this.isHost) {
          const hostId = `${peerPrefix}-host`;
          this.connectToPeer(hostId);
        }
      });

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.warn('[Multiplayer] PeerJS warning:', err);
      });
    } catch (e) {
      console.warn('[Multiplayer] Failed to initialize PeerJS:', e);
    }
  }

  connectToPeer(remotePeerId) {
    if (!this.peer || this.connections.has(remotePeerId)) return;
    try {
      const conn = this.peer.connect(remotePeerId, { reliable: true });
      this.setupConnection(conn);
    } catch (e) {
      console.warn('[Multiplayer] Connect error:', e);
    }
  }

  setupConnection(conn) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
      // Send greeting & state
      conn.send({
        type: 'JOIN',
        senderId: this.localPlayer.id,
        player: this.localPlayer
      });

      // If host, send current character claims to the newly joined peer
      if (this.isHost) {
        conn.send({
          type: 'SYNC_CLAIMS',
          claims: this.getClaimsPayload()
        });
      }
    });

    conn.on('data', (data) => {
      this.handleIncomingMessage(data);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
    });

    conn.on('error', () => {
      this.connections.delete(conn.peer);
    });
  }

  /**
   * Broadcast message to BroadcastChannel and all WebRTC connections
   */
  broadcast(msg) {
    if (!this.active) return;
    msg.timestamp = Date.now();

    // BroadcastChannel
    if (this.bc) {
      try {
        this.bc.postMessage(msg);
      } catch (e) {
        console.warn('BC send error:', e);
      }
    }

    // WebRTC connections
    this.connections.forEach((conn) => {
      if (conn.open) {
        try {
          conn.send(msg);
        } catch (e) {
          console.warn('Peer send error:', e);
        }
      }
    });
  }

  /**
   * Handle messages received from any transport
   */
  handleIncomingMessage(msg) {
    if (!msg || !msg.type || msg.senderId === this.localPlayer.id) return;

    switch (msg.type) {
      case 'JOIN': {
        const p = msg.player;
        this.peers.set(p.id, {
          id: p.id,
          name: p.name,
          charId: p.charId,
          x: p.x || 512,
          y: p.y || 245,
          targetX: p.x || 512,
          targetY: p.y || 245,
          direction: p.direction || 'down',
          isMoving: !!p.isMoving,
          animFrame: p.animFrame || 0,
          scene: p.scene || 'OFFICE_HALL',
          lastSeen: Date.now()
        });

        if (p.charId) {
          this.setCharacterClaim(p.charId, p.id, p.name);
        }

        // Respond with our current state so new player learns about us
        this.broadcast({
          type: 'PRESENCE',
          senderId: this.localPlayer.id,
          player: this.localPlayer
        });

        if (this.isHost) {
          this.broadcast({
            type: 'SYNC_CLAIMS',
            senderId: this.localPlayer.id,
            claims: this.getClaimsPayload()
          });
        }

        if (this.onToast) {
          this.onToast(`👋 ${p.name} joined the room!`);
        }
        if (this.onLobbyUpdate) this.onLobbyUpdate();
        break;
      }

      case 'PRESENCE': {
        const p = msg.player;
        const existing = this.peers.get(p.id) || {};
        this.peers.set(p.id, {
          ...existing,
          id: p.id,
          name: p.name,
          charId: p.charId,
          x: p.x,
          y: p.y,
          targetX: p.x,
          targetY: p.y,
          direction: p.direction,
          isMoving: !!p.isMoving,
          animFrame: p.animFrame,
          scene: p.scene,
          lastSeen: Date.now()
        });

        if (p.charId) {
          this.setCharacterClaim(p.charId, p.id, p.name);
        }
        if (this.onLobbyUpdate) this.onLobbyUpdate();
        break;
      }

      case 'CLAIM_CHAR': {
        const { charId, playerId, playerName } = msg;
        this.setCharacterClaim(charId, playerId, playerName);

        // If local player was holding this character, conflict resolution:
        if (this.localPlayer.charId === charId && playerId !== this.localPlayer.id) {
          // If the other player claimed it first (or host takes priority), release
          if (!this.isHost) {
            this.localPlayer.charId = null;
            if (this.onToast) {
              this.onToast(`⚠️ ${playerName} selected this character first. Please choose another!`);
            }
          }
        }
        if (this.onLobbyUpdate) this.onLobbyUpdate();
        break;
      }

      case 'RELEASE_CHAR': {
        const { charId, playerId } = msg;
        const char = this.characters.find(c => c.id === charId);
        if (char && char.claimedBy === playerId) {
          char.claimedBy = null;
          char.claimedByName = null;
          char.available = true;
        }
        if (this.onLobbyUpdate) this.onLobbyUpdate();
        break;
      }

      case 'SYNC_CLAIMS': {
        if (Array.isArray(msg.claims)) {
          msg.claims.forEach(item => {
            const char = this.characters.find(c => c.id === item.charId);
            if (char) {
              char.claimedBy = item.claimedBy;
              char.claimedByName = item.claimedByName;
              char.available = !item.claimedBy;
            }
          });
        }
        if (this.onLobbyUpdate) this.onLobbyUpdate();
        break;
      }

      case 'UPDATE_POS': {
        const p = this.peers.get(msg.senderId);
        if (p) {
          p.targetX = msg.x;
          p.targetY = msg.y;
          p.direction = msg.direction;
          p.isMoving = msg.isMoving;
          p.animFrame = msg.animFrame;
          p.scene = msg.scene;
          p.lastSeen = Date.now();
        }
        break;
      }

      case 'LEAVE': {
        const p = this.peers.get(msg.senderId);
        if (p) {
          // Release their claimed character
          this.characters.forEach(c => {
            if (c.claimedBy === msg.senderId) {
              c.claimedBy = null;
              c.claimedByName = null;
              c.available = true;
            }
          });
          if (this.onToast) {
            this.onToast(`🚶 ${p.name} left the room.`);
          }
          this.peers.delete(msg.senderId);
          if (this.onLobbyUpdate) this.onLobbyUpdate();
        }
        break;
      }
    }
  }

  resetCharacterClaims() {
    this.characters.forEach(c => {
      if (!c.isLocked) {
        c.claimedBy = null;
        c.claimedByName = null;
        c.available = true;
      }
    });
  }

  getClaimsPayload() {
    return this.characters.map(c => ({
      charId: c.id,
      claimedBy: c.claimedBy,
      claimedByName: c.claimedByName
    }));
  }

  setCharacterClaim(charId, playerId, playerName) {
    // Release any previous character this player had claimed
    this.characters.forEach(c => {
      if (c.claimedBy === playerId && c.id !== charId) {
        c.claimedBy = null;
        c.claimedByName = null;
        c.available = true;
      }
    });

    const targetChar = this.characters.find(c => c.id === charId);
    if (targetChar) {
      targetChar.claimedBy = playerId;
      targetChar.claimedByName = playerName;
      targetChar.available = false;
    }

    const peer = this.peers.get(playerId);
    if (peer) {
      peer.charId = charId;
    }
  }

  /**
   * Local Player Claims a Character
   * Returns { success: boolean, reason?: string }
   */
  selectCharacter(charId) {
    const char = this.characters.find(c => c.id === charId);
    if (!char) return { success: false, reason: 'Character not found' };
    if (char.isLocked) return { success: false, reason: 'This character is coming soon!' };

    // Unique Character Check: If already claimed by someone else
    if (char.claimedBy && char.claimedBy !== this.localPlayer.id) {
      return {
        success: false,
        reason: `Already selected by ${char.claimedByName || 'another player'}! Please pick a different character.`
      };
    }

    // Release existing claimed character if any
    if (this.localPlayer.charId && this.localPlayer.charId !== charId) {
      this.broadcast({
        type: 'RELEASE_CHAR',
        senderId: this.localPlayer.id,
        charId: this.localPlayer.charId,
        playerId: this.localPlayer.id
      });
    }

    this.localPlayer.charId = charId;
    this.setCharacterClaim(charId, this.localPlayer.id, this.localPlayer.name);

    this.broadcast({
      type: 'CLAIM_CHAR',
      senderId: this.localPlayer.id,
      charId: charId,
      playerId: this.localPlayer.id,
      playerName: this.localPlayer.name
    });

    if (this.onLobbyUpdate) this.onLobbyUpdate();
    return { success: true };
  }

  /**
   * Called on every frame/movement step to broadcast local position
   */
  broadcastPosition(playerState, currentScene) {
    if (!this.active) return;
    const now = performance.now();
    if (now - this.lastBroadcastTime < this.broadcastIntervalMs) return;
    this.lastBroadcastTime = now;

    this.localPlayer.x = playerState.x;
    this.localPlayer.y = playerState.y;
    this.localPlayer.direction = playerState.direction;
    this.localPlayer.isMoving = playerState.isMoving;
    this.localPlayer.animFrame = playerState.animFrame;
    this.localPlayer.scene = currentScene;

    this.broadcast({
      type: 'UPDATE_POS',
      senderId: this.localPlayer.id,
      x: Math.round(playerState.x),
      y: Math.round(playerState.y),
      direction: playerState.direction,
      isMoving: playerState.isMoving,
      animFrame: playerState.animFrame,
      scene: currentScene
    });
  }

  /**
   * Interpolate remote player positions for butter-smooth movement
   */
  updateRemotePlayers(dt) {
    if (!this.active) return;
    const lerpFactor = Math.min(1, dt * 18);

    this.peers.forEach(peer => {
      if (typeof peer.targetX === 'number' && typeof peer.targetY === 'number') {
        peer.x += (peer.targetX - peer.x) * lerpFactor;
        peer.y += (peer.targetY - peer.y) * lerpFactor;
      }
    });
  }

  /**
   * Leave room and clean up connections
   */
  disconnect() {
    if (!this.active) return;
    this.broadcast({
      type: 'LEAVE',
      senderId: this.localPlayer.id
    });

    if (this.bc) {
      try { this.bc.close(); } catch (e) {}
      this.bc = null;
    }

    if (this.peer) {
      try { this.peer.destroy(); } catch (e) {}
      this.peer = null;
    }

    this.connections.clear();
    this.peers.clear();
    this.resetCharacterClaims();
    this.active = false;
    this.localPlayer.charId = null;

    if (this.onLobbyUpdate) this.onLobbyUpdate();
  }
}

// Global Singleton
window.multiplayerEngine = new MultiplayerEngine();
