import { Name, NamedAPIResource } from '../../core/models/common.model';

export interface Berry {
  id: number;
  name: string;
  growth_time: number;
  max_harvest: number;
  natural_gift_power: number;
  size: number;
  smoothness: number;
  soil_dryness: number;
  firmness: NamedAPIResource;
  flavors: BerryFlavorEntry[];
  item: NamedAPIResource;
  natural_gift_type: NamedAPIResource;
}

export interface BerryFlavorEntry {
  potency: number;
  flavor: NamedAPIResource;
}

export interface BerryFirmness {
  id: number;
  name: string;
  berries: NamedAPIResource[];
  names: Name[];
}

export interface BerryFlavor {
  id: number;
  name: string;
  berries: FlavorBerryEntry[];
  contest_type: NamedAPIResource;
  names: Name[];
}

export interface FlavorBerryEntry {
  potency: number;
  berry: NamedAPIResource;
}
