"use server";

import { createClient } from "@/lib/supabase/server";

export async function getCategories() {
    const supabase = await createClient();

    const { data: families } = await supabase
        .from("product_families")
        .select("*")
        .order("ordre", { ascending: true });

    const { data: subcategories } = await supabase
        .from("product_subcategories")
        .select("*")
        .order("nom", { ascending: true });

    return {
        families: families || [],
        subcategories: subcategories || []
    };
}
