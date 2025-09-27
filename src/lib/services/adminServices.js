import { createClient } from '@supabase/supabase-js';


export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

export const getCompanyUsers = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .rpc('get_all_the_companies_users', {
        input_company_id: localStorage.getItem('company_id'),
        requesting_user_id: localStorage.getItem('current_user_id')
      });

    if (error) {
      console.log('RPC Error:', error);
      return { error: error.message };
    }

    if (data?.error) {
      return { error: data.error };
    }

    return { users: data };

  } catch (error) {
    console.log('Unexpected error:', error);
    return { error: error.message };
  }
};

export const getCompanyUsersForSuperAmin = async () => {
  try {
    const { data, error } = await supabaseAdmin.rpc("get_all_the_ai_navigator_users", {
      requesting_user_id: localStorage.getItem("current_user_id"),
    });


    if (error) {
      console.log('RPC Error:', error);
      return { error: error.message };
    }

    if (data?.error) {
      return { error: data.error };
    }

    return { users: data };

  } catch (error) {
    console.log('Unexpected error:', error);
    return { error: error.message };
  }
};

export const getAiNavigatorUsers = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .rpc('get_all_the_companies_users', {
        input_company_id: 6,
        requesting_user_id: localStorage.getItem('current_user_id')
      });

    if (error) {
      console.log('RPC Error:', error);
      return { error: error.message };
    }

    if (data?.error) {
      return { error: data.error };
    }

    return { users: data };

  } catch (error) {
    console.log('Unexpected error:', error);
    return { error: error.message };
  }
};


export const updateUserRoles = async (userId, newRoles) => {
  try {
    const { data, error } = await supabaseAdmin?.auth?.admin?.updateUserById(userId, {
      user_metadata: {
        system_roles: newRoles,
      },
    });

    if (error) {
      console.log('Failed to update role:', error.message);
    } else {
      console.log('User roles updated successfully:', data);
    }
  } catch (err) {
    console.log('Unexpected error while updating roles:', err);
  }
};
export const updateUserStatus = async (userId, status) => {
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: {
      account_status: status,
    },
  });

  if (error) return { error: error.message };
  return { user: data.user };
};


