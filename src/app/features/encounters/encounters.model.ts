import { NamedAPIResource, Name } from '../../core/models/common.model';

export interface EncounterMethod {
  id: number;
  name: string;
  order: number;
  names: Name[];
}

export interface EncounterCondition {
  id: number;
  name: string;
  names: Name[];
  values: NamedAPIResource[];
}

export interface EncounterConditionValue {
  id: number;
  name: string;
  condition: NamedAPIResource;
  names: Name[];
}
