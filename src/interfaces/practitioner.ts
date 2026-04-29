export interface Attendances {
  id?: number;
  present: boolean;
  date: string;
}

export interface Practitioner {
  id?: number;
  name: string;
  phone: string;
  attendances: Attendances[];
}
