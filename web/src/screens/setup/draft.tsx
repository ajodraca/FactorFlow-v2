import {
  type JSX,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/*
 * The setup screen's drafts (CAP-003-E4-S1; component design setup-ui 2.2
 * and 3; system design 4.4; DEC-0202 as the owner amended it). The four
 * values the owner enters are held in React state only, so they survive a
 * route change while this provider sits above the route, and a provider
 * mounted afresh (a reload) starts empty (DAC-E4-2, DAC-E4-S1-1). Nothing is
 * written to any browser store.
 *
 * The shell mounts the provider inside `ShellProvider` and outside the main
 * region's route map (CAP-003-E4-S6); this story mounts nothing.
 */

/** Everything the owner has typed or chosen in setup and not yet saved (setup-ui 2.2). */
export interface SetupDrafts {
  /** Step 2's field text, kept as typed. */
  yearsText: string;
  /** Step 3's radio choice; `null` until one is made. */
  source: "paste" | "later" | null;
  /** Step 3's pasted text, kept as typed. */
  pasted: string;
  /** Symbols step 3 could not post, kept for the owner to correct. */
  unposted: string[];
}

interface SetupDraftsValue {
  drafts: SetupDrafts;
  /** Changes one draft and leaves the other three as they are (AC-3). */
  setDraft<K extends keyof SetupDrafts>(key: K, value: SetupDrafts[K]): void;
}

const SetupDraftsContext = createContext<SetupDraftsValue | null>(null);

/** Holds the four drafts for the session above the `/setup` route (DAC-E4-2). */
export function SetupDraftProvider({ children }: { children: ReactNode }): JSX.Element {
  const [drafts, setDrafts] = useState<SetupDrafts>(() => ({
    yearsText: "",
    source: null,
    pasted: "",
    unposted: [],
  }));

  // A functional update, so two writes in one tick both land; an empty
  // dependency list, so a consumer may list the setter in its own.
  const setDraft = useCallback(
    <K extends keyof SetupDrafts>(key: K, value: SetupDrafts[K]): void => {
      setDrafts((previous) => ({ ...previous, [key]: value }));
    },
    [],
  );

  const value = useMemo(() => ({ drafts, setDraft }), [drafts, setDraft]);
  return <SetupDraftsContext.Provider value={value}>{children}</SetupDraftsContext.Provider>;
}

/** Reads and writes the setup drafts; throws outside `SetupDraftProvider`. */
export function useSetupDrafts(): SetupDraftsValue {
  const value = useContext(SetupDraftsContext);
  if (value === null) {
    throw new Error("useSetupDrafts() must be called inside <SetupDraftProvider>");
  }
  return value;
}
