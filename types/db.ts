import { ObjectId } from 'mongodb';

export interface Gardener {
  _id: ObjectId;
  name: string;
  phone?: string;
  created_at: Date;
}

export interface Plan {
  _id: ObjectId;
  year: number;
  month: number;
  locked: boolean;
  created_at: Date;
}

export interface PlanLink {
  _id: ObjectId;
  plan_id: ObjectId;
  gardener_id: ObjectId;
  token_hash: string;
  expires_at?: Date | null;
  created_at: Date;
}

export interface Assignment {
  _id: ObjectId;
  plan_id: ObjectId;
  gardener_id: ObjectId;
  work_date: Date;
  address: string;
  notes?: string;
  created_at: Date;
}

export interface Submission {
  _id: ObjectId;
  plan_id: ObjectId;
  gardener_id: ObjectId;
  submitted_at: Date;
}
