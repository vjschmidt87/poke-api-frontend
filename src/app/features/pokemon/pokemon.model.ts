import { NamedAPIResource, Name, VerboseEffect, FlavorText } from '../../core/models/common.model';

// --- Pokemon ---

export interface Pokemon {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  weight: number;
  order: number;
  is_default: boolean;
  sprites: PokemonSprites;
  types: PokemonTypeEntry[];
  abilities: PokemonAbilityEntry[];
  moves: PokemonMoveEntry[];
  stats: PokemonStatEntry[];
  species: NamedAPIResource;
  forms: NamedAPIResource[];
}

export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  front_female: string | null;
  front_shiny_female: string | null;
  back_default: string | null;
  back_shiny: string | null;
  other?: {
    'official-artwork'?: {
      front_default: string | null;
      front_shiny: string | null;
    };
  };
}

export interface PokemonTypeEntry {
  slot: number;
  type: NamedAPIResource;
}

export interface PokemonAbilityEntry {
  is_hidden: boolean;
  slot: number;
  ability: NamedAPIResource;
}

export interface PokemonMoveEntry {
  move: NamedAPIResource;
  version_group_details: VersionGroupDetail[];
}

export interface VersionGroupDetail {
  level_learned_at: number;
  version_group: NamedAPIResource;
  move_learn_method: NamedAPIResource;
}

export interface PokemonStatEntry {
  base_stat: number;
  effort: number;
  stat: NamedAPIResource;
}

// --- Ability ---

export interface Ability {
  id: number;
  name: string;
  is_main_series: boolean;
  generation: NamedAPIResource;
  names: Name[];
  effect_entries: VerboseEffect[];
  flavor_text_entries: FlavorText[];
  pokemon: AbilityPokemon[];
}

export interface AbilityPokemon {
  is_hidden: boolean;
  slot: number;
  pokemon: NamedAPIResource;
}

// --- Type ---

export interface TypeDetail {
  id: number;
  name: string;
  damage_relations: TypeRelations;
  pokemon: TypePokemon[];
  moves: NamedAPIResource[];
  names: Name[];
  generation: NamedAPIResource;
  move_damage_class: NamedAPIResource | null;
}

export interface TypeRelations {
  no_damage_to: NamedAPIResource[];
  half_damage_to: NamedAPIResource[];
  double_damage_to: NamedAPIResource[];
  no_damage_from: NamedAPIResource[];
  half_damage_from: NamedAPIResource[];
  double_damage_from: NamedAPIResource[];
}

export interface TypePokemon {
  slot: number;
  pokemon: NamedAPIResource;
}

// --- Pokemon Species ---

export interface PokemonSpecies {
  id: number;
  name: string;
  order: number;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  hatch_counter: number;
  has_gender_differences: boolean;
  forms_switchable: boolean;
  growth_rate: NamedAPIResource;
  egg_groups: NamedAPIResource[];
  color: NamedAPIResource;
  shape: NamedAPIResource;
  habitat: NamedAPIResource | null;
  generation: NamedAPIResource;
  names: Name[];
  flavor_text_entries: FlavorText[];
  genera: Genus[];
  evolution_chain: { url: string };
  varieties: PokemonVariety[];
}

export interface Genus {
  genus: string;
  language: NamedAPIResource;
}

export interface PokemonVariety {
  is_default: boolean;
  pokemon: NamedAPIResource;
}

// --- Nature ---

export interface Nature {
  id: number;
  name: string;
  decreased_stat: NamedAPIResource | null;
  increased_stat: NamedAPIResource | null;
  hates_flavor: NamedAPIResource | null;
  likes_flavor: NamedAPIResource | null;
  names: Name[];
  pokeathlon_stat_changes: PokeathlonStatChange[];
  move_battle_style_preferences: MoveBattleStylePreference[];
}

export interface PokeathlonStatChange {
  max_change: number;
  pokeathlon_stat: NamedAPIResource;
}

export interface MoveBattleStylePreference {
  low_hp_preference: number;
  high_hp_preference: number;
  move_battle_style: NamedAPIResource;
}
