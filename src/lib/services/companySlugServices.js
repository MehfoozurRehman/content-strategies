
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


export const fetchUserCompanySlug = async () => {
    const companyId = localStorage.getItem("company_id");
  
    if (!companyId) {
      throw new Error("Company ID not found in localStorage.");
    }
  
    const { data: company, error } = await supabase
      .from("companies")
      .select("slug")
      .eq("id", companyId)
      .maybeSingle();
  
    if (error) throw error;
    if (!company) throw new Error("Company not found.");
  
    return company.slug;
  };

  

