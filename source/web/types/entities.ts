export type Product = {
  id: number;
  name: string;
};

export type Layer = {
  id: number;
  name: string;
  type: Type;
};

export type Experiment = {
  id: number;
  name: string;
  traffic: number;
  start_time: number;
  end_time: number;
  status: Status;
};

export type Group = {
  id: number;
  name: string;

  parameters: Parameter[];
};

export type Parameter = {
  name: string;
  value: string;
};

export enum Status {
  UNKNOWN,
  START,
  END,
}

export enum Type {
  UNKNOWN,
  USER_ID,
  SESSION_ID,
}
