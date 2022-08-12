import { Experiment, Group, Layer, Parameter, Product } from './entities';

export type APIParameter = {
  name: string;
};

export type APIProduct = Product & {};

export type APILayer = Layer & {
  product_id: number;
};

export type APIExperiment = Experiment & {
  layer_id: number;
};

export type APIGroup = Group & {
  exp_id: number;
};

export type SummaryProduct = Product & {
  layers: SummaryLayer[];
};

export type SummaryLayer = Layer & {
  unused_traffic: number;
  experiments: SummaryExperiment[];
};

export type SummaryExperiment = Experiment & {
  groups: SummaryGroup[];
};

export type SummaryGroup = Group & {};

export type ABTestRequest = {
  product_id: number;
  user_id: number;
  session_id: number;
};

export type ABTestReponse = {
  ab_tests: ABTest[];
};

export type ABTest = {
  product_id: number;
  layer_id: number;
  experiment_id: number;
  group_id: number;

  parameters: Parameter[];
};
