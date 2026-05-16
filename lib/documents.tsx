"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
} from "react";
import {
  QuoteSettings,
  Profile,
  Customer,
  DocumentType,
  DEFAULT_QUOTE,
  DEFAULT_PROFILE,
  generateDocumentNumber,
} from "./types";
import {
  loadDraft as loadLocalDraft,
  saveDraft as saveLocalDraft,
  loadProfile as loadLocalProfile,
  saveProfile as saveLocalProfile,
  hasLocalDraftData,
  getMigrationStatus,
  setMigrationStatus,
} from "./storage";
import * as repo from "./repository";
import * as fin from "./finance";
import { calculate } from "./calc";
import { useAuth } from "./auth";

interface DocumentContextValue {
  loading: boolean;
  activeId: string | null;
  activeType: DocumentType;
  activeClientId: string | null;
  data: QuoteSettings;
  profile: Profile;
  documents: repo.DocumentSummary[];
  clients: repo.ClientSummary[];
  role: repo.UserRole;
  saveStatus: "saving" | "saved" | null;
  shouldShowMigration: boolean;
  dismissMigration: () => void;
  completeMigration: () => Promise<void>;

  setData: (next: QuoteSettings) => void;
  setProfile: (next: Profile) => void;
  switchType: (type: DocumentType) => void;
  openDocument: (id: string) => Promise<void>;
  newDocument: (type: DocumentType, sourceId?: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  refreshList: () => Promise<void>;
  flushSave: () => Promise<void>;

  refreshClients: () => Promise<void>;
  attachClient: (
    clientId: string | null,
    fillCustomer?: boolean
  ) => Promise<void>;
  saveCurrentCustomerAsClient: () => Promise<repo.ClientRecord | null>;
  recordIncomeFromCurrent: () => Promise<fin.IncomeRecord | null>;
}

const DocumentContext = createContext<DocumentContextValue | null>(null);

const ACTIVE_KEY = "freelance-solo-active-doc";

export function DocumentProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<DocumentType>("quote");
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [data, setDataState] = useState<QuoteSettings>(DEFAULT_QUOTE);
  const [profile, setProfileState] = useState<Profile>(DEFAULT_PROFILE);
  const [documents, setDocuments] = useState<repo.DocumentSummary[]>([]);
  const [clients, setClients] = useState<repo.ClientSummary[]>([]);
  const [role, setRole] = useState<repo.UserRole>("user");
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | null>(
    null
  );
  const [shouldShowMigration, setShouldShowMigration] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedStatusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initRef = useRef(false);

  // refs that always reflect the latest values so debounced saves don't get stale closures
  const activeIdRef = useRef<string | null>(null);
  const activeTypeRef = useRef<DocumentType>("quote");
  const activeClientIdRef = useRef<string | null>(null);
  const userRef = useRef<typeof user>(null);
  const dataRef = useRef<QuoteSettings>(DEFAULT_QUOTE);
  const profileRef = useRef<Profile>(DEFAULT_PROFILE);
  const creatingRef = useRef(false);
  const mountedRef = useRef(true);

  // keep refs in sync with state on every render
  activeIdRef.current = activeId;
  activeTypeRef.current = activeType;
  activeClientIdRef.current = activeClientId;
  userRef.current = user;
  dataRef.current = data;
  profileRef.current = profile;

  const refreshList = useCallback(async () => {
    if (!user) {
      setDocuments([]);
      return;
    }
    try {
      const docs = await repo.listDocuments();
      setDocuments(docs);
    } catch (e) {
      console.error("refreshList failed", e);
    }
  }, [user]);

  const refreshClients = useCallback(async () => {
    if (!user) {
      setClients([]);
      return;
    }
    try {
      const list = await repo.listClients();
      setClients(list);
    } catch (e) {
      console.error("refreshClients failed", e);
    }
  }, [user]);

  // track mount/unmount so async writes don't fire on a dead component
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (profileTimer.current) clearTimeout(profileTimer.current);
      if (savedStatusTimer.current) clearTimeout(savedStatusTimer.current);
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (initRef.current && !user) {
      // logout: cancel any pending debounced save so it doesn't fire after auth ends
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
      if (profileTimer.current) {
        clearTimeout(profileTimer.current);
        profileTimer.current = null;
      }
      setActiveId(null);
      setActiveClientId(null);
      setDataState(loadLocalDraft());
      setProfileState(loadLocalProfile());
      setDocuments([]);
      setClients([]);
      setRole("user");
      setLoading(false);
      try {
        localStorage.removeItem(ACTIVE_KEY);
      } catch {}
      return;
    }
    initRef.current = true;

    (async () => {
      setLoading(true);
      if (user) {
        try {
          const remoteProfile = await repo.fetchProfile();
          setProfileState(remoteProfile);
        } catch (e) {
          console.error(e);
        }

        try {
          const r = await repo.fetchUserRole();
          setRole(r);
        } catch {
          setRole("user");
        }

        try {
          const list = await repo.listClients();
          setClients(list);
        } catch (e) {
          console.error(e);
        }

        try {
          const docs = await repo.listDocuments();
          setDocuments(docs);

          const lastId =
            typeof window !== "undefined"
              ? localStorage.getItem(ACTIVE_KEY)
              : null;
          let target = docs.find((d) => d.id === lastId);
          if (!target && docs.length > 0) target = docs[0];

          if (target) {
            const rec = await repo.getDocument(target.id);
            if (rec) {
              setActiveId(rec.id);
              setActiveType(rec.type);
              setActiveClientId(rec.client_id || null);
              setDataState(rec.data);
            }
          } else {
            setActiveId(null);
            setActiveClientId(null);
            setActiveType("quote");
            setDataState({
              ...DEFAULT_QUOTE,
              quoteNumber: generateDocumentNumber("quote"),
            });
          }
        } catch (e) {
          console.error(e);
        }

        const migrated = getMigrationStatus(user.id);
        if (!migrated && hasLocalDraftData()) {
          setShouldShowMigration(true);
        }
      } else {
        setActiveId(null);
        setActiveClientId(null);
        setActiveType("quote");
        setDataState(loadLocalDraft());
        setProfileState(loadLocalProfile());
        setDocuments([]);
        setClients([]);
        setRole("user");
      }
      setLoading(false);
    })();
  }, [user, authLoading]);

  // performSave reads ALL state from refs, so it never has a stale closure on
  // activeId / activeType / activeClientId / user. The doc id captured at the
  // start of save is used for the entire write to avoid clobbering a different
  // document if the user clicks away mid-debounce.
  const performSave = useCallback(async (next: QuoteSettings) => {
    const currentUser = userRef.current;
    const targetId = activeIdRef.current;
    const targetType = activeTypeRef.current;
    const targetClientId = activeClientIdRef.current;

    try {
      if (currentUser && targetId) {
        await repo.updateDocument(targetId, { data: next });
        if (!mountedRef.current) return;
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === targetId
              ? {
                  ...d,
                  customerName: next.customer?.name || "",
                  projectName: next.projectName || "",
                  updatedAt: new Date().toISOString(),
                }
              : d
          )
        );
      } else if (currentUser && !targetId) {
        // first save for a brand-new doc — guard against concurrent debounce
        // firings creating duplicate rows
        if (creatingRef.current) return;
        creatingRef.current = true;
        try {
          const rec = await repo.createDocument({
            type: targetType,
            number: next.quoteNumber || generateDocumentNumber(targetType),
            data: next,
            clientId: targetClientId,
          });
          if (!mountedRef.current) return;
          setActiveId(rec.id);
          activeIdRef.current = rec.id;
          try {
            localStorage.setItem(ACTIVE_KEY, rec.id);
          } catch {}
          const list = await repo.listDocuments();
          if (!mountedRef.current) return;
          setDocuments(list);
        } finally {
          creatingRef.current = false;
        }
      } else if (!currentUser) {
        saveLocalDraft(next);
      }
      if (!mountedRef.current) return;
      setSaveStatus("saved");
      if (savedStatusTimer.current) clearTimeout(savedStatusTimer.current);
      savedStatusTimer.current = setTimeout(() => {
        if (mountedRef.current) setSaveStatus(null);
      }, 1500);
    } catch (e) {
      console.error("save failed", e);
      if (mountedRef.current) setSaveStatus(null);
    }
  }, []);

  const setData = useCallback(
    (next: QuoteSettings) => {
      setDataState(next);
      dataRef.current = next;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setSaveStatus("saving");
      saveTimer.current = setTimeout(() => {
        // always save the most recent data, not whatever was captured 500ms ago
        performSave(dataRef.current);
      }, 500);
    },
    [performSave]
  );

  const flushSave = useCallback(async () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    await performSave(dataRef.current);
  }, [performSave]);

  const setProfile = useCallback((next: Profile) => {
    setProfileState(next);
    profileRef.current = next;
    if (profileTimer.current) clearTimeout(profileTimer.current);
    profileTimer.current = setTimeout(async () => {
      try {
        if (userRef.current) {
          await repo.saveProfile(profileRef.current);
        } else {
          saveLocalProfile(profileRef.current);
        }
      } catch (e) {
        console.error("save profile failed", e);
      }
    }, 400);
  }, []);

  const switchType = useCallback((type: DocumentType) => {
    setActiveType(type);
  }, []);

  const openDocument = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const rec = await repo.getDocument(id);
      if (rec) {
        setActiveId(rec.id);
        setActiveType(rec.type);
        setActiveClientId(rec.client_id || null);
        setDataState(rec.data);
        try {
          localStorage.setItem(ACTIVE_KEY, rec.id);
        } catch {}
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const newDocument = useCallback(
    async (type: DocumentType, sourceId?: string) => {
      if (!user) {
        setActiveId(null);
        setActiveClientId(null);
        setActiveType(type);
        setDataState({
          ...DEFAULT_QUOTE,
          quoteNumber: generateDocumentNumber(type),
        });
        return;
      }

      let baseData: QuoteSettings = {
        ...DEFAULT_QUOTE,
        quoteNumber: generateDocumentNumber(type),
      };
      let linkedFromId: string | null = null;
      let clientId: string | null = null;
      if (sourceId) {
        try {
          const src = await repo.getDocument(sourceId);
          if (src) {
            baseData = {
              ...src.data,
              quoteNumber: generateDocumentNumber(type),
              dueDate: type === "invoice" ? "" : src.data.dueDate,
              paidDate: type === "receipt" ? "" : src.data.paidDate,
              paymentMethod:
                type === "receipt" ? "" : src.data.paymentMethod,
            };
            linkedFromId = src.id;
            clientId = src.client_id || null;
          }
        } catch (e) {
          console.error(e);
        }
      }

      try {
        const rec = await repo.createDocument({
          type,
          number: baseData.quoteNumber,
          data: baseData,
          linkedFromId,
          clientId,
        });
        setActiveId(rec.id);
        setActiveType(type);
        setActiveClientId(clientId);
        setDataState(baseData);
        try {
          localStorage.setItem(ACTIVE_KEY, rec.id);
        } catch {}
        await refreshList();
      } catch (e) {
        console.error(e);
      }
    },
    [user, refreshList]
  );

  const deleteDocument = useCallback(
    async (id: string) => {
      if (!user) return;
      try {
        await repo.deleteDocument(id);
        const remaining = documents.filter((d) => d.id !== id);
        setDocuments(remaining);
        if (activeId === id) {
          if (remaining.length > 0) {
            await openDocument(remaining[0].id);
          } else {
            setActiveId(null);
            setActiveClientId(null);
            setDataState({
              ...DEFAULT_QUOTE,
              quoteNumber: generateDocumentNumber(activeType),
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
    },
    [user, documents, activeId, activeType, openDocument]
  );

  const attachClient = useCallback(
    async (clientId: string | null, fillCustomer = true) => {
      setActiveClientId(clientId);
      if (user && activeId) {
        try {
          await repo.updateDocument(activeId, { clientId });
        } catch (e) {
          console.error("attachClient failed", e);
        }
      }
      if (!clientId || !fillCustomer) return;
      try {
        const rec = await repo.getClient(clientId);
        if (rec) {
          const customer: Customer = repo.recordToCustomer(rec);
          setData({ ...data, customer });
        }
      } catch (e) {
        console.error(e);
      }
    },
    [user, activeId, data, setData]
  );

  const saveCurrentCustomerAsClient =
    useCallback(async (): Promise<repo.ClientRecord | null> => {
      if (!user) return null;
      const c = data.customer;
      if (!c || !c.name.trim()) return null;

      try {
        const existing = await repo.findClientByName(c.name);
        if (existing) {
          await attachClient(existing.id, false);
          return existing;
        }
        const created = await repo.createClient(c);
        await refreshClients();
        await attachClient(created.id, false);
        return created;
      } catch (e) {
        console.error("save customer as client failed", e);
        return null;
      }
    }, [user, data.customer, attachClient, refreshClients]);

  const recordIncomeFromCurrent = useCallback(async (): Promise<
    fin.IncomeRecord | null
  > => {
    const currentUser = userRef.current;
    if (!currentUser) return null;
    const d = dataRef.current;
    const calc = calculate(d);
    const amount =
      Number(d.paidAmount) > 0 ? Number(d.paidAmount) : calc.total;
    if (!amount || amount <= 0) return null;
    const wht = d.tax3Percent ? calc.taxDeduction : 0;
    const vat = d.vat7 ? calc.vatAmount : 0;
    // use local-date today instead of UTC slice to avoid timezone off-by-one
    const today = (() => {
      const n = new Date();
      const y = n.getFullYear();
      const m = String(n.getMonth() + 1).padStart(2, "0");
      const dd = String(n.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    })();
    const receivedAt = d.paidDate || today;
    try {
      const rec = await fin.createIncome({
        clientId: activeClientIdRef.current,
        documentId: activeIdRef.current,
        category: "service",
        description:
          d.projectName ||
          d.customer?.name ||
          d.quoteNumber ||
          "รายรับ",
        amount,
        currency: profileRef.current.currency,
        whtAmount: wht,
        vatAmount: vat,
        receivedAt,
      });
      return rec;
    } catch (e) {
      console.error("recordIncomeFromCurrent failed", e);
      return null;
    }
  }, []);

  const dismissMigration = useCallback(() => {
    if (user) setMigrationStatus(user.id);
    setShouldShowMigration(false);
  }, [user]);

  const completeMigration = useCallback(async () => {
    if (user) setMigrationStatus(user.id);
    setShouldShowMigration(false);
    await refreshList();
    await refreshClients();
  }, [user, refreshList, refreshClients]);

  return (
    <DocumentContext.Provider
      value={{
        loading,
        activeId,
        activeType,
        activeClientId,
        data,
        profile,
        documents,
        clients,
        role,
        saveStatus,
        shouldShowMigration,
        dismissMigration,
        completeMigration,
        setData,
        setProfile,
        switchType,
        openDocument,
        newDocument,
        deleteDocument,
        refreshList,
        flushSave,
        refreshClients,
        attachClient,
        saveCurrentCustomerAsClient,
        recordIncomeFromCurrent,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error("useDocuments must be inside DocumentProvider");
  return ctx;
}
