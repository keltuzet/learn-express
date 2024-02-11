import { v4 as uuidv4 } from "uuid";
import { MinimalUser, User } from "./models";

export class Users {
  private readonly hashMap = new Map<string, User>();

  public getUsers(): User[] {
    return Array.from(this.hashMap.values());
  }

  public getUser(id: string): User | undefined {
    return this.hashMap.get(id);
  }

  public addUser(user: MinimalUser): void {
    const id = uuidv4();
    this.hashMap.set(id, { ...user, id });
  }

  public hasUser(id: string): boolean {
    return this.hashMap.has(id);
  }
}

const users = new Users();

export default users;
