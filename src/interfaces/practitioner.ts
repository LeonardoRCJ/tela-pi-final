export interface Attendances {
  id?: number;
  present: boolean;
  date: string;
}

export interface Practitioner {
  id?: number;
  practitionerName: string;
  attendances: Attendances[];
}
