// CodeXa Anti-Cheat Proctoring & Contest Ban Manager
// Enforces a strict 5-warning threshold. Upon 5 warnings, user is blocked for 1 Month.

const BAN_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 Days (1 Month)
const MAX_WARNINGS = 5;

// Storage keys
const getWarningKey = (contestId, userId) => `codexa_proctoring_warnings_${contestId || 'global'}_${userId || 'anonymous'}`;
const getBanKey = (userId) => `codexa_contest_ban_${userId || 'anonymous'}`;
const PROCTORING_EVENT = 'codexa_proctoring_update';

export const proctoringService = {
  MAX_WARNINGS,

  // Check if a contestant is currently banned from participating in contests
  checkUserBan(userId) {
    if (!userId) return { isBanned: false };
    try {
      const raw = localStorage.getItem(getBanKey(userId));
      if (!raw) return { isBanned: false };
      const banData = JSON.parse(raw);
      if (Date.now() > banData.bannedUntil) {
        // Ban expired after 1 month
        localStorage.removeItem(getBanKey(userId));
        return { isBanned: false };
      }
      return {
        isBanned: true,
        bannedAt: banData.bannedAt,
        bannedUntil: banData.bannedUntil,
        reason: banData.reason || 'Exceeded 5 anti-cheat security warnings during contest',
        contestId: banData.contestId,
        formattedExpiry: new Date(banData.bannedUntil).toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    } catch {
      return { isBanned: false };
    }
  },

  // Record an anti-cheat violation for a contestant
  recordViolation(contestId, userId, userName, reason, violationType = 'PROCTOR_VIOLATION') {
    if (!userId) return { count: 0, isBanned: false };

    const key = getWarningKey(contestId, userId);
    let warnings = [];
    try {
      const existing = localStorage.getItem(key);
      if (existing) warnings = JSON.parse(existing);
    } catch {
      warnings = [];
    }

    const newViolation = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      timestamp: Date.now(),
      reason,
      violationType
    };

    warnings.unshift(newViolation);
    localStorage.setItem(key, JSON.stringify(warnings));

    // Also register user into the contest's live participant list for admin monitoring
    this.registerActiveContestant(contestId, userId, userName, warnings.length);

    // If 5 or more warnings, trigger 1-Month Ban
    let isBanned = false;
    let banInfo = null;
    if (warnings.length >= MAX_WARNINGS) {
      banInfo = this.banUser(userId, userName, contestId, `Exceeded maximum ${MAX_WARNINGS} anti-cheat security warnings (${reason})`);
      isBanned = true;
    }

    // Broadcast change
    window.dispatchEvent(new CustomEvent(PROCTORING_EVENT, {
      detail: { contestId, userId, warningsCount: warnings.length, isBanned }
    }));

    return {
      warnings,
      count: warnings.length,
      isBanned,
      banInfo,
      remaining: Math.max(0, MAX_WARNINGS - warnings.length)
    };
  },

  // Get current warnings for a specific user in a contest
  getWarnings(contestId, userId) {
    if (!userId) return [];
    try {
      const existing = localStorage.getItem(getWarningKey(contestId, userId));
      return existing ? JSON.parse(existing) : [];
    } catch {
      return [];
    }
  },

  // Ban user for 1 Month (30 days)
  banUser(userId, userName, contestId, reason) {
    const bannedAt = Date.now();
    const bannedUntil = bannedAt + BAN_DURATION_MS;

    const banData = {
      userId,
      userName: userName || 'Contestant',
      contestId,
      bannedAt,
      bannedUntil,
      reason: reason || 'Exceeded 5 anti-cheat security warnings (1-Month Contest Ban)'
    };

    localStorage.setItem(getBanKey(userId), JSON.stringify(banData));

    // Update contest roster state
    this.updateContestantStatus(contestId, userId, { isBanned: true, bannedUntil });

    window.dispatchEvent(new CustomEvent(PROCTORING_EVENT, {
      detail: { userId, contestId, isBanned: true }
    }));

    return banData;
  },

  // Admin manually unbans / pardons user
  unbanUser(userId, contestId) {
    localStorage.removeItem(getBanKey(userId));
    if (contestId) {
      localStorage.removeItem(getWarningKey(contestId, userId));
      this.updateContestantStatus(contestId, userId, { isBanned: false, warningsCount: 0 });
    }
    window.dispatchEvent(new CustomEvent(PROCTORING_EVENT, {
      detail: { userId, contestId, isBanned: false }
    }));
  },

  // Register contestant presence for the monitoring dashboard
  registerActiveContestant(contestId, userId, userName, warningsCount = 0) {
    if (!contestId || !userId) return;
    const rosterKey = `codexa_contest_roster_${contestId}`;
    try {
      let roster = {};
      const raw = localStorage.getItem(rosterKey);
      if (raw) roster = JSON.parse(raw);

      const banCheck = this.checkUserBan(userId);

      roster[userId] = {
        userId,
        userName: userName || `Contestant #${userId}`,
        lastSeen: Date.now(),
        warningsCount,
        isBanned: banCheck.isBanned,
        bannedUntil: banCheck.bannedUntil,
        cameraActive: true
      };

      localStorage.setItem(rosterKey, JSON.stringify(roster));
    } catch {}
  },

  // Update specific contestant status (e.g. from admin panel)
  updateContestantStatus(contestId, userId, updates) {
    if (!contestId || !userId) return;
    const rosterKey = `codexa_contest_roster_${contestId}`;
    try {
      let roster = {};
      const raw = localStorage.getItem(rosterKey);
      if (raw) roster = JSON.parse(raw);

      if (roster[userId]) {
        roster[userId] = { ...roster[userId], ...updates };
        localStorage.setItem(rosterKey, JSON.stringify(roster));
      }
    } catch {}
  },

  // Get all monitored contestants for a contest
  getContestRoster(contestId) {
    if (!contestId) return {};
    try {
      const raw = localStorage.getItem(`codexa_contest_roster_${contestId}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  // Listen for real-time updates (cross-tab via storage and in-tab via CustomEvent)
  subscribe(callback) {
    const handleCustom = (e) => callback(e.detail);
    const handleStorage = (e) => {
      if (e.key && (e.key.startsWith('codexa_proctoring_') || e.key.startsWith('codexa_contest_ban_') || e.key.startsWith('codexa_contest_roster_'))) {
        callback({ key: e.key });
      }
    };

    window.addEventListener(PROCTORING_EVENT, handleCustom);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(PROCTORING_EVENT, handleCustom);
      window.removeEventListener('storage', handleStorage);
    };
  }
};
