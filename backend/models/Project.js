const { supabase } = require('../config/supabase');

class Project {
  static async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data;
  }

  static async getById(id) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getByGithubRepo(repo) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('github_repo', repo)
      .maybeSingle();
    
    if (error) throw error;
    return data; // returns null if no project found
  }

  static async create(projectData) {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async update(id, projectData) {
    const { data, error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { error } = await supabase
      .from('projects')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  static async getProjectUsers(projectId) {
    const { data, error } = await supabase
      .from('project_users')
      .select(`
        *,
        users (*)
      `)
      .eq('project_id', projectId);
    
    if (error) throw error;
    return data;
  }

  static async addUserToProject(projectId, userId, role = 'reviewer', permissions = {}) {
    const { data, error } = await supabase
      .from('project_users')
      .insert([{
        project_id: projectId,
        user_id: userId,
        role,
        notify_on_pr: permissions.notify_on_pr ?? true,
        notify_on_push: permissions.notify_on_push ?? false
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async removeUserFromProject(projectId, userId) {
    const { error } = await supabase
      .from('project_users')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);
    
    if (error) throw error;
    return true;
  }

  static async updateUserPermissions(projectId, userId, permissions) {
    const { data, error } = await supabase
      .from('project_users')
      .update(permissions)
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

module.exports = Project;
