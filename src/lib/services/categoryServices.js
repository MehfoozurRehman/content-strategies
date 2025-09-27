import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


export const fetchCategoryLabels = async () => {
  try {

    const { data, error } = await supabase.rpc('get_category_labels');
    // const { data, error } = await supabase.rpc('get_category_labels', {
    //   current_company_id: localStorage.getItem('company_id'),
    // });

    console.log("Raw RPC response:", { data, error });

    if (error) throw error;

    if (!Array.isArray(data)) {
      console.warn("Unexpected data format:", data);
      return [];
    }

    return data;
  } catch (error) {
    console.log("Fetch error:", error);
    return [];
  }
};
