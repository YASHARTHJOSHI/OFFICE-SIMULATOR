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
      isSitting: false,
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
    const peerPrefix = `offsim-${cleanRoom}`;
    // Host has fixed deterministic ID; guests have unique IDs
    const myId = this.isHost ? `${peerPrefix}-host` : `${peerPrefix}-p-${this.localPlayer.id}`;

    try {
      if (this.peer) {
        try { this.peer.destroy(); } catch (e) {}
      }

      this.peer = new Peer(myId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun.cloudflare.com:3478' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        this.peerId = id;
        console.log('[Multiplayer] WebRTC PeerJS online with ID:', id);

        // If guest, connect to the host
        if (!this.isHost) {
          const hostId = `${peerPrefix}-host`;
          this.connectToPeer(hostId);
        }
        if (this.onLobbyUpdate) this.onLobbyUpdate();
      });

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.warn('[Multiplayer] PeerJS event:', err.type, err);
        // If host ID was already taken when trying to host, join as guest instead!
        if (err.type === 'unavailable-id' && this.isHost) {
          console.log('[Multiplayer] Room host already active, connecting as peer...');
          this.isHost = false;
          this.initPeerJS();
        }
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
      console.log('[Multiplayer] WebRTC connection established with:', conn.peer);

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

        // Inform other peers to connect to this new peer (mesh networking)
        this.broadcast({
          type: 'PEER_DISCOVERY',
          peerId: conn.peer
        });
      }

      if (this.onLobbyUpdate) this.onLobbyUpdate();
    });

    conn.on('data', (data) => {
      this.handleIncomingMessage(data);

      // Host star-relay: if host receives state update from one peer, forward it to all other peers
      if (this.isHost && data && data.type) {
        this.connections.forEach((otherConn, otherPeerId) => {
          if (otherPeerId !== conn.peer && otherConn.open) {
            try { otherConn.send(data); } catch (e) {}
          }
        });
      }
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      if (this.onLobbyUpdate) this.onLobbyUpdate();
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
    try {
      if (!msg || !msg.type || msg.senderId === this.localPlayer.id) return;

      // De-duplicate repeated packets (e.g. if received over both BC and WebRTC)
      const msgKey = `${msg.senderId}_${msg.type}_${msg.timestamp || 0}`;
      if (!this.recentMsgKeys) this.recentMsgKeys = new Set();
      if (this.recentMsgKeys.has(msgKey)) return;
      this.recentMsgKeys.add(msgKey);
      if (this.recentMsgKeys.size > 250) this.recentMsgKeys.clear();

      switch (msg.type) {
        case 'PEER_DISCOVERY': {
          if (msg.peerId && msg.peerId !== this.peerId && !this.connections.has(msg.peerId)) {
            this.connectToPeer(msg.peerId);
          }
          break;
        }
        case 'JOIN': {
          const p = msg.player;
          if (!p || !p.id) break;
          const validX = Number.isFinite(p.x) ? p.x : 512;
          const validY = Number.isFinite(p.y) ? p.y : 245;

          this.peers.set(p.id, {
            id: p.id,
            name: p.name || 'Colleague',
            charId: p.charId || null,
            x: validX,
            y: validY,
            targetX: validX,
            targetY: validY,
            direction: p.direction || 'down',
            isMoving: !!p.isMoving,
            animFrame: typeof p.animFrame === 'number' ? p.animFrame : 0,
            scene: p.scene || 'OFFICE_HALL',
            isSitting: !!p.isSitting,
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
            this.onToast(`👋 ${p.name || 'Colleague'} joined the room!`);
          }
          if (this.onLobbyUpdate) this.onLobbyUpdate();
          break;
        }

        case 'PRESENCE': {
          const p = msg.player;
          if (!p || !p.id) break;
          const existing = this.peers.get(p.id) || {};
          const validX = Number.isFinite(p.x) ? p.x : (Number.isFinite(existing.x) ? existing.x : 512);
          const validY = Number.isFinite(p.y) ? p.y : (Number.isFinite(existing.y) ? existing.y : 245);

          this.peers.set(p.id, {
            ...existing,
            id: p.id,
            name: p.name || existing.name || 'Colleague',
            charId: p.charId || existing.charId || null,
            x: validX,
            y: validY,
            targetX: validX,
            targetY: validY,
            direction: p.direction || existing.direction || 'down',
            isMoving: !!p.isMoving,
            animFrame: typeof p.animFrame === 'number' ? p.animFrame : 0,
            scene: p.scene || existing.scene || 'OFFICE_HALL',
            isSitting: typeof p.isSitting === 'boolean' ? p.isSitting : !!existing.isSitting,
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
            if (Number.isFinite(msg.x)) p.targetX = msg.x;
            if (Number.isFinite(msg.y)) p.targetY = msg.y;
            if (!Number.isFinite(p.x)) p.x = p.targetX;
            if (!Number.isFinite(p.y)) p.y = p.targetY;
            if (msg.direction) p.direction = msg.direction;
            p.isMoving = !!msg.isMoving;
            if (typeof msg.animFrame === 'number') p.animFrame = msg.animFrame;
            if (msg.scene) p.scene = msg.scene;
            if (typeof msg.isSitting === 'boolean') p.isSitting = msg.isSitting;
            p.lastSeen = Date.now();
          }
          break;
        }

        case 'LEAVE': {
          const p = this.peers.get(msg.senderId);
          if (p) {
            this.characters.forEach(c => {
              if (c.claimedBy === msg.senderId) {
                c.claimedBy = null;
                c.claimedByName = null;
                c.available = true;
              }
            });
            if (this.onToast) {
              this.onToast(`🚶 ${p.name || 'Colleague'} left the room.`);
            }
            this.peers.delete(msg.senderId);
            if (this.onLobbyUpdate) this.onLobbyUpdate();
          }
          break;
        }
      }
    } catch (err) {
      console.warn('[Multiplayer] Incoming message processing error:', err);
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
      scene: currentScene,
      isSitting: !!playerState.isSitting
    });
  }

  /**
   * Interpolate remote player positions for butter-smooth movement
   */
  updateRemotePlayers(dt) {
    if (!this.active) return;
    const lerpFactor = Math.min(1, Math.max(0, dt * 18));

    this.peers.forEach(peer => {
      if (!Number.isFinite(peer.x)) peer.x = Number.isFinite(peer.targetX) ? peer.targetX : 512;
      if (!Number.isFinite(peer.y)) peer.y = Number.isFinite(peer.targetY) ? peer.targetY : 245;
      if (!Number.isFinite(peer.targetX)) peer.targetX = peer.x;
      if (!Number.isFinite(peer.targetY)) peer.targetY = peer.y;

      peer.x += (peer.targetX - peer.x) * lerpFactor;
      peer.y += (peer.targetY - peer.y) * lerpFactor;
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
