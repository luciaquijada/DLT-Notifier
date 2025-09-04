const { supabase } = require('../config/supabase');

class User {
  static async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .order('display_name');
    
    if (error) throw error;
    return data;
  }

  static async getById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getByGithubUsername(username) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('github_username', username)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async create(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async update(id, userData) {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  static async getUserProjects(userId) {
    const { data, error } = await supabase
      .from('project_users')
      .select(`
        *,
        projects (*)
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  }
}

module.exports = User;
