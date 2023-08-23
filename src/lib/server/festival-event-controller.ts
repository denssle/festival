import redis from "$lib/redis";
import type { FestivalEvent } from "$lib/models/FestivalEvent";

export async function getAllListItems() {
  const keys: string[] = await redis.keys("festival:*");
  const result: FestivalEvent[] = [];
  for (const key of keys) {
    if (key) {
      const newVar: string | null = await redis.get(key);
      if (newVar) {
        result.push(JSON.parse(newVar));
      }
    }
  }
  return result;
}

export async function getFestival(id: string): Promise<FestivalEvent | null> {
  console.log("get", id);
  const mayBeFestival: string | null = await redis.get(id);
  if (mayBeFestival) {
    return JSON.parse(mayBeFestival);
  }
  return null;
}

export function create(name: string, description: string): void {
  console.log("add new entry", name);
  const newFestival: FestivalEvent = { id: `festival:${crypto.randomUUID()}`, name: name, description: description };
  redis.set(newFestival.id, JSON.stringify(newFestival));
}
