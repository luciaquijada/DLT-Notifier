const { supabase } = require('../config/supabase');

class Activity {
  static async getAll(limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        projects (name, emoji, github_repo),
        users (github_username, display_name, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }

  static async getByProject(projectId, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        projects (name, emoji, github_repo),
        users (github_username, display_name, avatar_url)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }

  static async getByUser(userId, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        projects (name, emoji, github_repo),
        users (github_username, display_name, avatar_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }

  static async create(activityData) {
    const { data, error } = await supabase
      .from('activities')
      .insert([activityData])
      .select(`
        *,
        projects (name, emoji, github_repo),
        users (github_username, display_name, avatar_url)
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getStats(projectId = null, timeframe = '7 days') {
    let query = supabase
      .from('activities')
      .select('event_type, created_at');

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    // Filtrar por timeframe
    const now = new Date();
    const timeframeDate = new Date();
    
    switch (timeframe) {
      case '24 hours':
        timeframeDate.setHours(now.getHours() - 24);
        break;
      case '7 days':
        timeframeDate.setDate(now.getDate() - 7);
        break;
      case '30 days':
        timeframeDate.setDate(now.getDate() - 30);
        break;
      default:
        timeframeDate.setDate(now.getDate() - 7);
    }

    query = query.gte('created_at', timeframeDate.toISOString());

    const { data, error } = await query;
    
    if (error) throw error;

    // Procesar estadísticas
    const stats = {
      total: data.length,
      by_type: {},
      by_day: {}
    };

    data.forEach(activity => {
      // Por tipo
      stats.by_type[activity.event_type] = (stats.by_type[activity.event_type] || 0) + 1;
      
      // Por día
      const day = new Date(activity.created_at).toISOString().split('T')[0];
      stats.by_day[day] = (stats.by_day[day] || 0) + 1;
    });

    return stats;
  }
}

module.exports = Activity;
