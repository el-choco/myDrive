export interface UserType {
  name: string;
  email: string;
  emailVerified?: boolean;
  storageUsed?: number;
  storageLimit?: number;
}