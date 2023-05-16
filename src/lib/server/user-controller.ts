import type { User } from "$lib/models/User";
import { compareSync, hashSync } from "bcrypt-ts";
import redis from "$lib/redis";

export function register(email: string, password: string): void {
  console.log("register: ", email, password);
  if (!emailInvalid(email)) {
    const user: User = { email: email, password: hashSync(password) }; // , genSaltSync(7)
    saveUser(user).then(value => {
      console.log("saved user", value);
    });
  }
}

export async function login(email: string, password: string): Promise<User | null> {
  console.log("login", email, password);
  const user = await loadUser(email);
  if (user && user.password) {
    if (compareSync(password, user.password)) {
      return user;
    }
  }
  return null;
}

export async function validateSessionToken(userString: string | undefined): Promise<boolean> {
  // TODO Check token age
  console.log("session validation: userString: ", userString);
  if (userString) {
    try {
      const user: User = JSON.parse(userString) as User;
      if (user.email && user.password) {
        const found: User | null = await loadUser(user?.email);
        if (found && found.password) {
          console.log("session validation: compare", found.password === user.password, found.password, user.password);
          return found.password === user.password;
        } else {
          console.log("session validation: no user in db found", found);
        }
      } else {
        console.log("session validation: token user invalid", user);
      }
    } catch (e) {
      console.error("session validation error", e);
    }
  }
  return false;
}

export function emailInvalid(email: string): boolean {
  return !email || email.length === 0; // || userMap.has(email);
}

const saveUser = (user: User): Promise<string> => {
  return redis.set(user.email, JSON.stringify(user));
};

const loadUser = (email: string): Promise<User | null> => {
  return redis.get(email).then(value => {
    if (value) {
      return JSON.parse(value) as User;
    }
    return null;
  });
};