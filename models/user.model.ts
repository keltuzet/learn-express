export interface MinimalUser {
  firstName: string;
  lastName: string;
  middleName?: string;
  age: number;
}

export enum UserStatus {
  Unknown = "unknown",
}

export interface User extends MinimalUser {
  id: string;
}
