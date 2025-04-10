export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number
          name: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          id: number
          name: string
          price: number
          description: string
          category_id: number
          image_url: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          price: number
          description: string
          category_id: number
          image_url: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          price?: number
          description?: string
          category_id?: number
          image_url?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: number
          order_id: number
          menu_item_id: number
          quantity: number
          created_at: string
        }
        Insert: {
          id?: number
          order_id: number
          menu_item_id: number
          quantity: number
          created_at?: string
        }
        Update: {
          id?: number
          order_id?: number
          menu_item_id?: number
          quantity?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          id: number
          user_id: string
          status: string
          phone_number: string
          delivery_address: string
          special_instructions: string | null
          total: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          status: string
          total: number
          delivery_address: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          status?: string
          total?: number
          delivery_address?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          id: string
          code: string
          discount_percentage: number
          is_active: boolean
          expiry_date: string
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          discount_percentage: number
          is_active?: boolean
          expiry_date: string
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          discount_percentage?: number
          is_active?: boolean
          expiry_date?: string
          created_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          email: string
          username: string
          role: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          role: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          role?: string
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
