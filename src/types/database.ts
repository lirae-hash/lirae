export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Vibe = "dark" | "gold" | "rose" | "sage";
export type SpiceLevel = 1 | 2 | 3;
export type Ending = "hea" | "hfn" | "heartbreak";
export type PurchaseStatus = "pending" | "paid" | "refunded";
export type HeroArchetype = "brooding" | "cinnamon" | "rogue" | "protector" | "tortured" | "golden";

export interface ChoiceLogEntry {
  id: string;
  text: string;
  tag: "open" | "guarded";
}

export interface SettingSheet {
  heroName: string;
  setting: string;
  worldDetails: Record<string, string>;
  [key: string]: unknown;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          age_confirmed: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          age_confirmed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          age_confirmed?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      adventures: {
        Row: {
          id: string;
          title: string;
          trope: string;
          blurb: string | null;
          setting_sheet: SettingSheet;
          cover_image_url: string | null;
          published: boolean;
          sort_order: number;
        };
        Insert: {
          id: string;
          title: string;
          trope: string;
          blurb?: string | null;
          setting_sheet: SettingSheet;
          cover_image_url?: string | null;
          published?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          title?: string;
          trope?: string;
          blurb?: string | null;
          setting_sheet?: SettingSheet;
          cover_image_url?: string | null;
          published?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      playthroughs: {
        Row: {
          id: string;
          reader_id: string | null;
          adventure_id: string;
          vibe: Vibe;
          archetype: HeroArchetype;
          spice: SpiceLevel;
          protagonist_name: string | null;
          choice_log: ChoiceLogEntry[];
          current_chapter: number;
          ending: Ending | null;
          final_words: string | null;
          anonymous_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reader_id?: string | null;
          adventure_id: string;
          vibe: Vibe;
          archetype: HeroArchetype;
          spice: SpiceLevel;
          protagonist_name?: string | null;
          choice_log?: ChoiceLogEntry[];
          current_chapter?: number;
          ending?: Ending | null;
          final_words?: string | null;
          anonymous_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reader_id?: string | null;
          adventure_id?: string;
          vibe?: Vibe;
          archetype?: HeroArchetype;
          spice?: SpiceLevel;
          protagonist_name?: string | null;
          choice_log?: ChoiceLogEntry[];
          current_chapter?: number;
          ending?: Ending | null;
          final_words?: string | null;
          anonymous_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "playthroughs_reader_id_fkey";
            columns: ["reader_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "playthroughs_adventure_id_fkey";
            columns: ["adventure_id"];
            referencedRelation: "adventures";
            referencedColumns: ["id"];
          }
        ];
      };
      chapters_cache: {
        Row: {
          id: string;
          adventure_id: string;
          chapter_no: number;
          vibe: Vibe;
          spice: SpiceLevel;
          archetype: HeroArchetype | null;
          path_hash: string;
          prose: string;
          choices: Json | null;
          scene_image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          adventure_id: string;
          chapter_no: number;
          vibe: Vibe;
          spice: SpiceLevel;
          archetype?: HeroArchetype | null;
          path_hash: string;
          prose: string;
          choices?: Json | null;
          scene_image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          adventure_id?: string;
          chapter_no?: number;
          vibe?: Vibe;
          spice?: SpiceLevel;
          archetype?: HeroArchetype | null;
          path_hash?: string;
          prose?: string;
          choices?: Json | null;
          scene_image_url?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chapters_cache_adventure_id_fkey";
            columns: ["adventure_id"];
            referencedRelation: "adventures";
            referencedColumns: ["id"];
          }
        ];
      };
      purchases: {
        Row: {
          id: string;
          reader_id: string;
          adventure_id: string;
          stripe_session_id: string | null;
          amount_cents: number | null;
          status: PurchaseStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          reader_id: string;
          adventure_id: string;
          stripe_session_id?: string | null;
          amount_cents?: number | null;
          status?: PurchaseStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          reader_id?: string;
          adventure_id?: string;
          stripe_session_id?: string | null;
          amount_cents?: number | null;
          status?: PurchaseStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "purchases_reader_id_fkey";
            columns: ["reader_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchases_adventure_id_fkey";
            columns: ["adventure_id"];
            referencedRelation: "adventures";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
