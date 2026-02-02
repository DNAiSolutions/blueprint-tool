import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlignSession, Industry, SessionNode, SessionMetrics } from '@/types/session';
import { useAuth } from '@/hooks/useAuth';

interface SessionContextType {
  currentSession: AlignSession | null;
  sessions: AlignSession[];
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

export function SessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<AlignSession | null>(null);
  const [sessions, setSessions] = useState<AlignSession[]>([]);

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
  }, []);

  const loadSession = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
    }
  }, [sessions]);

  return (
    <SessionContext.Provider
      value={{
        currentSession,
        sessions,
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
