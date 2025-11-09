import { supabase } from "@/integrations/supabase/client";
import type { ColorValue } from "@/components/ColorPickerDialog";

export interface DbCategory {
  id: string;
  user_id: string;
  title: string;
  color: string;
  column_index: number;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface DbLink {
  id: string;
  category_id: string;
  title: string;
  url: string;
  description: string | null;
  icon: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export const createCategory = async (userId: string, title: string, color: ColorValue, columnIndex: number, position: number) => {
  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: userId,
      title,
      color,
      column_index: columnIndex,
      position,
    })
    .select()
    .single();

  return { data, error };
};

export const updateCategory = async (id: string, title: string, color: ColorValue) => {
  const { error } = await supabase
    .from("categories")
    .update({ title, color })
    .eq("id", id);

  return { error };
};

export const updateCategoryPosition = async (id: string, columnIndex: number, position: number) => {
  const { error } = await supabase
    .from("categories")
    .update({ column_index: columnIndex, position })
    .eq("id", id);

  return { error };
};

export const deleteCategory = async (id: string) => {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  return { error };
};

export const createLink = async (categoryId: string, title: string, url: string, description?: string, icon?: string) => {
  const category = await supabase
    .from("links")
    .select("position")
    .eq("category_id", categoryId)
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const position = category.data ? category.data.position + 1 : 0;

  const { data, error } = await supabase
    .from("links")
    .insert({
      category_id: categoryId,
      title,
      url,
      description: description || null,
      icon: icon || null,
      position,
    })
    .select()
    .single();

  return { data, error };
};

export const updateLink = async (id: string, title: string, url: string, description?: string, icon?: string) => {
  const { error } = await supabase
    .from("links")
    .update({
      title,
      url,
      description: description || null,
      icon: icon || null,
    })
    .eq("id", id);

  return { error };
};

export const updateLinkPosition = async (id: string, position: number) => {
  const { error } = await supabase
    .from("links")
    .update({ position })
    .eq("id", id);

  return { error };
};

export const deleteLink = async (id: string) => {
  const { error } = await supabase
    .from("links")
    .delete()
    .eq("id", id);

  return { error };
};
