import { Practitioner } from "./practitioner";

export interface SimpleClassGroup {
  id?: number;
  name: string;
  countPractitioners: number;
  qrToken: string;
}

export interface ClassGroup {
  id?: number;
  name: string;
  qrToken: string;
  practitioners: Practitioner[];
  
}
