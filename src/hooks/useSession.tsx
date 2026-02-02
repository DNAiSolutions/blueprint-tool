import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { AlignSession, Industry, SessionNode, SessionMetrics } from '@/types/session';
import { useAuth } from '@/hooks/useAuth';

const STORAGE_KEY = 'align-sessions';
const CURRENT_SESSION_KEY = 'align-current-session-id';

interface SessionContextType {
  currentSession: AlignSession | null;
  sessions: AlignSession[];
  isSessionReady: boolean;
  createSession: (clientName: string, industry?: Industry) => AlignSession;
  updateSession: (session: Partial<AlignSession>) => void;
  addNode: (node: Omit<SessionNode, 'id'>) => void;
  updateNode: (nodeId: string, updates: Partial<SessionNode>) => void;
  deleteNode: (nodeId: string) => void;
  clearSession: () => void;
  loadSession: (sessionId: string) => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function createEmptyMetrics(): SessionMetrics {
  return {
    conversionByStage: {},
    dropoffByStage: {},
    revenueLeakByStage: {},
    totalRevenueAtRisk: 0,
  };
}

// Helper to serialize session for localStorage (Date objects -> strings)
function serializeSessions(sessions: AlignSession[]): string {
  return JSON.stringify(sessions, (key, value) => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  });
}

// Helper to deserialize sessions from localStorage (strings -> Date objects)
function deserializeSessions(json: string): AlignSession[] {
  try {
    const parsed = JSON.parse(json);
    return parsed.map((session: any) => ({
      ...session,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
    }));
  } catch {
    return [];
  }
}

// Load sessions from localStorage
function loadSessionsFromStorage(): AlignSession[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return deserializeSessions(stored);
    }
  } catch (e) {
    console.error('Failed to load sessions from localStorage:', e);
  }
  return [];
}

// Save sessions to localStorage
function saveSessionsToStorage(sessions: AlignSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, serializeSessions(sessions));
  } catch (e) {
    console.error('Failed to save sessions to localStorage:', e);
  }
}

// Load current session ID from localStorage
function loadCurrentSessionIdFromStorage(): string | null {
  try {
    return localStorage.getItem(CURRENT_SESSION_KEY);
  } catch {
    return null;
  }
}

// Save current session ID to localStorage
function saveCurrentSessionIdToStorage(sessionId: string | null): void {
  try {
    if (sessionId) {
      localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
    } else {
      localStorage.removeItem(CURRENT_SESSION_KEY);
    }
  } catch (e) {
    console.error('Failed to save current session ID:', e);
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<AlignSession[]>(() => loadSessionsFromStorage());
  const [currentSession, setCurrentSession] = useState<AlignSession | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false);

  // Persist sessions to localStorage whenever they change
  useEffect(() => {
    saveSessionsToStorage(sessions);
  }, [sessions]);

  // Persist currentSessionId whenever it changes
  useEffect(() => {
    saveCurrentSessionIdToStorage(currentSession?.id || null);
  }, [currentSession?.id]);

  const createSession = useCallback((clientName: string, industry?: Industry): AlignSession => {
    const newSession: AlignSession = {
      id: generateId(),
      clientName,
      industry,
      repName: user?.user_metadata?.full_name || user?.email || 'Unknown Rep',
      repId: user?.id || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      nodes: [],
      metrics: createEmptyMetrics(),
      status: 'draft',
    };

    setCurrentSession(newSession);
    setSessions(prev => [...prev, newSession]);
    setIsSessionReady(true);
    
    return newSession;
  }, [user]);

  const updateSession = useCallback((updates: Partial<AlignSession>) => {
    if (!currentSession) return;
    
    const updated = {
      ...currentSession,
      ...updates,
      updatedAt: new Date(),
    };
    
    setCurrentSession(updated);
    setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
  }, [currentSession]);

  const addNode = useCallback((node: Omit<SessionNode, 'id'>) => {
    if (!currentSession) return;

    const newNode: SessionNode = {
      ...node,
      id: generateId(),
    };

    const updatedNodes = [...currentSession.nodes, newNode];
    updateSession({ nodes: updatedNodes, status: 'in-progress' });
  }, [currentSession, updateSession]);

  const updateNode = useCallback((nodeId: string, updates: Partial<SessionNode>) => {
    if (!currentSession) return;

    const updatedNodes = currentSession.nodes.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    );
    
    updateSession({ nodes: updatedNodes });
  }, [currentSession, updateSession]);

  const deleteNode = useCallback((nodeId: string) => {
    if (!currentSession) return;

    const updatedNodes = currentSession.nodes.filter(node => node.id !== nodeId);
    // Also remove connections to this node
    const cleanedNodes = updatedNodes.map(node => ({
      ...node,
      connections: node.connections.filter(id => id !== nodeId),
    }));
    
    updateSession({ nodes: cleanedNodes });
  }, [currentSession, updateSession]);

  const clearSession = useCallback(() => {
    setCurrentSession(null);
    setIsSessionReady(false);
  }, []);

  const loadSession = useCallback((sessionId: string) => {
    // First, try to find in current in-memory sessions
    let session = sessions.find(s => s.id === sessionId);
    
    // If not in memory, try to load from storage
    if (!session) {
      const storedSessions = loadSessionsFromStorage();
      session = storedSessions.find(s => s.id === sessionId);
      
      // If found in storage but not in memory, update memory state
      if (session && !sessions.some(s => s.id === sessionId)) {
        setSessions(storedSessions);
      }
    }
    
    if (session) {
      setCurrentSession(session);
      setIsSessionReady(true);
    } else {
      // Session not found anywhere - create a new one with this ID
      // This ensures Canvas can always work even with direct URLs
      const newSession: AlignSession = {
        id: sessionId,
        clientName: 'New Session',
        repName: user?.user_metadata?.full_name || user?.email || 'Unknown Rep',
        repId: user?.id || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        nodes: [],
        metrics: createEmptyMetrics(),
        status: 'draft',
      };
      
      setCurrentSession(newSession);
      setSessions(prev => [...prev, newSession]);
      setIsSessionReady(true);
    }
  }, [sessions, user]);

  return (
    <SessionContext.Provider
      value={{
        currentSession,
        sessions,
        isSessionReady,
        createSession,
        updateSession,
        addNode,
        updateNode,
        deleteNode,
        clearSession,
        loadSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
