import { requestJson } from "../../api/client";

export interface PaletteUniverse {
  readonly id: string;
  readonly name: string;
}

/**
 * The active universes, read once per opening and only while research routes
 * are registered (DAC-E3-11, DAC-E3-S5-2). The request is the one the story
 * names: no limit is sent, so the route's default page applies.
 */
export async function fetchActiveUniverses(
  signal?: AbortSignal,
): Promise<readonly PaletteUniverse[]> {
  const body = await requestJson<{ universes: { universe_id: string; name: string }[] }>(
    "/api/universes?lifecycle=active",
    { signal },
  );
  return body.universes.map((u) => ({ id: u.universe_id, name: u.name }));
}
