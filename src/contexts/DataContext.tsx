import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  db,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { Company, Work, TeamMember, RDOReport, DocumentItem } from '../types';
import { DEMO_COMPANIES, DEMO_WORKS, DEMO_TEAM, DEMO_RDOS, DEMO_DOCUMENTS } from '../data/demoData';
import { useAuth } from './AuthContext';

interface DataContextType {
  companies: Company[];
  works: Work[];
  teamMembers: TeamMember[];
  rdos: RDOReport[];
  documents: DocumentItem[];
  selectedWorkId: string;
  setSelectedWorkId: (id: string) => void;
  activeWork: Work | undefined;
  loading: boolean;
  
  // CRUD Methods
  addCompany: (comp: Omit<Company, 'id' | 'createdAt' | 'createdBy'>) => Promise<string>;
  addWork: (work: Omit<Work, 'id' | 'createdAt' | 'createdBy'>) => Promise<string>;
  updateWork: (id: string, work: Partial<Work>) => Promise<void>;
  deleteWork: (id: string) => Promise<void>;
  addTeamMember: (member: Omit<TeamMember, 'id' | 'createdAt' | 'createdBy'>) => Promise<string>;
  deleteTeamMember: (id: string) => Promise<void>;
  saveRDO: (rdo: Partial<RDOReport> & { workId: string; date: string }) => Promise<string>;
  deleteRDO: (id: string) => Promise<void>;
  addDocument: (docItem: Omit<DocumentItem, 'id' | 'createdAt' | 'createdBy'>) => Promise<string>;
  deleteDocument: (id: string) => Promise<void>;
  seedDemoData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [companies, setCompanies] = useState<Company[]>(DEMO_COMPANIES);
  const [works, setWorks] = useState<Work[]>(DEMO_WORKS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(DEMO_TEAM);
  const [rdos, setRdos] = useState<RDOReport[]>(DEMO_RDOS);
  const [documents, setDocuments] = useState<DocumentItem[]>(DEMO_DOCUMENTS);
  const [selectedWorkId, setSelectedWorkId] = useState<string>('demo-work-1');
  const [loading, setLoading] = useState<boolean>(false);

  // Sync real-time Firestore collections when user is authenticated
  useEffect(() => {
    if (!user || user.uid === 'demo-user') {
      // In demo mode or offline, keep demonstration state
      return;
    }

    setLoading(true);

    // Snapshot listeners for collections
    const unsubs: Array<() => void> = [];

    try {
      // Works listener
      const worksUnsub = onSnapshot(
        collection(db, 'works'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Work));
            setWorks(list);
            if (!list.find((w) => w.id === selectedWorkId) && list.length > 0) {
              setSelectedWorkId(list[0].id);
            }
          }
        },
        (error) => handleFirestoreError(error, OperationType.GET, 'works')
      );
      unsubs.push(worksUnsub);

      // Companies listener
      const compUnsub = onSnapshot(
        collection(db, 'companies'),
        (snapshot) => {
          if (!snapshot.empty) {
            setCompanies(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Company)));
          }
        },
        (error) => handleFirestoreError(error, OperationType.GET, 'companies')
      );
      unsubs.push(compUnsub);

      // Team members listener
      const teamUnsub = onSnapshot(
        collection(db, 'teamMembers'),
        (snapshot) => {
          if (!snapshot.empty) {
            setTeamMembers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as TeamMember)));
          }
        },
        (error) => handleFirestoreError(error, OperationType.GET, 'teamMembers')
      );
      unsubs.push(teamUnsub);

      // RDOs listener
      const rdosUnsub = onSnapshot(
        collection(db, 'rdos'),
        (snapshot) => {
          if (!snapshot.empty) {
            setRdos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as RDOReport)));
          }
        },
        (error) => handleFirestoreError(error, OperationType.GET, 'rdos')
      );
      unsubs.push(rdosUnsub);

      // Documents listener
      const docsUnsub = onSnapshot(
        collection(db, 'documents'),
        (snapshot) => {
          if (!snapshot.empty) {
            setDocuments(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as DocumentItem)));
          }
        },
        (error) => handleFirestoreError(error, OperationType.GET, 'documents')
      );
      unsubs.push(docsUnsub);
    } catch (err) {
      console.warn('Realtime listener error, falling back to local dataset:', err);
    } finally {
      setLoading(false);
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [user]);

  const activeWork = works.find((w) => w.id === selectedWorkId) || works[0];

  const addCompany = async (comp: Omit<Company, 'id' | 'createdAt' | 'createdBy'>) => {
    const id = 'comp-' + Date.now();
    const newComp: Company = {
      ...comp,
      id,
      createdBy: user?.uid || 'user',
      createdAt: new Date().toISOString(),
    };

    if (user && user.uid !== 'demo-user') {
      try {
        await setDoc(doc(db, 'companies', id), newComp);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `companies/${id}`);
      }
    } else {
      setCompanies((prev) => [newComp, ...prev]);
    }
    return id;
  };

  const addWork = async (workData: Omit<Work, 'id' | 'createdAt' | 'createdBy'>) => {
    const id = 'work-' + Date.now();
    const newWork: Work = {
      ...workData,
      id,
      createdBy: user?.uid || 'user',
      createdAt: new Date().toISOString(),
    };

    if (user && user.uid !== 'demo-user') {
      try {
        await setDoc(doc(db, 'works', id), newWork);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `works/${id}`);
      }
    } else {
      setWorks((prev) => [newWork, ...prev]);
      setSelectedWorkId(id);
    }
    return id;
  };

  const updateWork = async (id: string, workData: Partial<Work>) => {
    if (user && user.uid !== 'demo-user') {
      try {
        await updateDoc(doc(db, 'works', id), workData);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `works/${id}`);
      }
    } else {
      setWorks((prev) => prev.map((w) => (w.id === id ? { ...w, ...workData } : w)));
    }
  };

  const deleteWork = async (id: string) => {
    if (user && user.uid !== 'demo-user') {
      try {
        await deleteDoc(doc(db, 'works', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `works/${id}`);
      }
    } else {
      setWorks((prev) => prev.filter((w) => w.id !== id));
      if (selectedWorkId === id && works.length > 1) {
        setSelectedWorkId(works.find((w) => w.id !== id)?.id || '');
      }
    }
  };

  const addTeamMember = async (memberData: Omit<TeamMember, 'id' | 'createdAt' | 'createdBy'>) => {
    const id = 'team-' + Date.now();
    const newMember: TeamMember = {
      ...memberData,
      id,
      createdBy: user?.uid || 'user',
      createdAt: new Date().toISOString(),
    };

    if (user && user.uid !== 'demo-user') {
      try {
        await setDoc(doc(db, 'teamMembers', id), newMember);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `teamMembers/${id}`);
      }
    } else {
      setTeamMembers((prev) => [newMember, ...prev]);
    }
    return id;
  };

  const deleteTeamMember = async (id: string) => {
    if (user && user.uid !== 'demo-user') {
      try {
        await deleteDoc(doc(db, 'teamMembers', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `teamMembers/${id}`);
      }
    } else {
      setTeamMembers((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const saveRDO = async (rdoData: Partial<RDOReport> & { workId: string; date: string }) => {
    const existing = rdoData.id ? rdos.find((r) => r.id === rdoData.id) : undefined;
    const id = rdoData.id || 'rdo-' + Date.now();
    
    // Auto calculate next sequential number if new
    const workRdos = rdos.filter((r) => r.workId === rdoData.workId);
    const nextSeq = existing ? existing.sequentialNumber : workRdos.length + 1;
    const targetWork = works.find((w) => w.id === rdoData.workId);

    const fullRDO: RDOReport = {
      id,
      sequentialNumber: rdoData.sequentialNumber || nextSeq,
      date: rdoData.date,
      workId: rdoData.workId,
      workName: targetWork?.name || rdoData.workName || 'Obra sem identificação',
      status: rdoData.status || 'Rascunho',
      authorId: user?.uid || 'user',
      authorName: rdoData.authorName || profile?.displayName || 'Engenheiro Responsável',
      authorRole: rdoData.authorRole || 'Engenheiro Civil',
      weatherMorning: rdoData.weatherMorning || '',
      weatherAfternoon: rdoData.weatherAfternoon || '',
      weatherNight: rdoData.weatherNight || '',
      workFronts: rdoData.workFronts || '',
      activities: rdoData.activities || '',
      progressPercent: Number(rdoData.progressPercent) || 0,
      labor: rdoData.labor || '',
      equipment: rdoData.equipment || '',
      materials: rdoData.materials || '',
      occurrences: rdoData.occurrences || '',
      safety: rdoData.safety || '',
      observations: rdoData.observations || '',
      photos: rdoData.photos || [],
      pdfGenerated: rdoData.pdfGenerated || false,
      createdBy: existing ? existing.createdBy : (user?.uid || 'user'),
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: existing?.isDemo,
    };

    if (user && user.uid !== 'demo-user') {
      try {
        await setDoc(doc(db, 'rdos', id), fullRDO);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `rdos/${id}`);
      }
    } else {
      setRdos((prev) => {
        const idx = prev.findIndex((r) => r.id === id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = fullRDO;
          return updated;
        }
        return [fullRDO, ...prev];
      });
    }

    // Also update physical progress on work if it was finalized
    if (rdoData.progressPercent && rdoData.status === 'Finalizado') {
      updateWork(rdoData.workId, { physicalProgress: Number(rdoData.progressPercent) });
    }

    return id;
  };

  const deleteRDO = async (id: string) => {
    if (user && user.uid !== 'demo-user') {
      try {
        await deleteDoc(doc(db, 'rdos', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `rdos/${id}`);
      }
    } else {
      setRdos((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const addDocument = async (docItem: Omit<DocumentItem, 'id' | 'createdAt' | 'createdBy'>) => {
    const id = 'doc-' + Date.now();
    const newDoc: DocumentItem = {
      ...docItem,
      id,
      createdBy: user?.uid || 'user',
      createdAt: new Date().toISOString(),
    };

    if (user && user.uid !== 'demo-user') {
      try {
        await setDoc(doc(db, 'documents', id), newDoc);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `documents/${id}`);
      }
    } else {
      setDocuments((prev) => [newDoc, ...prev]);
    }
    return id;
  };

  const deleteDocument = async (id: string) => {
    if (user && user.uid !== 'demo-user') {
      try {
        await deleteDoc(doc(db, 'documents', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `documents/${id}`);
      }
    } else {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const seedDemoData = async () => {
    setCompanies(DEMO_COMPANIES);
    setWorks(DEMO_WORKS);
    setTeamMembers(DEMO_TEAM);
    setRdos(DEMO_RDOS);
    setDocuments(DEMO_DOCUMENTS);
    setSelectedWorkId('demo-work-1');
  };

  return (
    <DataContext.Provider
      value={{
        companies,
        works,
        teamMembers,
        rdos,
        documents,
        selectedWorkId,
        setSelectedWorkId,
        activeWork,
        loading,
        addCompany,
        addWork,
        updateWork,
        deleteWork,
        addTeamMember,
        deleteTeamMember,
        saveRDO,
        deleteRDO,
        addDocument,
        deleteDocument,
        seedDemoData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
