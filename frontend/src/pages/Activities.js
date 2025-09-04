import React, { useState, useEffect } from 'react';
import { Filter, Calendar } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    loadActivities();
    loadProjects();
  }, [filterType, filterProject]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, emoji')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error cargando proyectos:', error);
    }
  };

  const loadActivities = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('activities')
        .select(`
          *,
          projects(name, emoji),
          users(github_username, display_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (filterType !== 'all') {
        query = query.eq('event_type', filterType);
      }

      if (filterProject !== 'all') {
        query = query.eq('project_id', filterProject);
      }

      const { data, error } = await query;

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error cargando actividades:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (eventType) => {
    switch (eventType) {
      case 'pull_request':
        return 'bg-blue-100 text-blue-800';
      case 'push':
        return 'bg-green-100 text-green-800';
      case 'review':
        return 'bg-purple-100 text-purple-800';
      case 'merge':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeText = (eventType) => {
    switch (eventType) {
      case 'pull_request':
        return 'Pull Request';
      case 'push':
        return 'Push';
      case 'review':
        return 'Review';
      case 'merge':
        return 'Merge';
      default:
        return eventType;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando actividades...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Actividades</h1>
        <p className="text-gray-600">Historial de actividades del sistema</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">Todos los tipos</option>
            <option value="pull_request">Pull Requests</option>
            <option value="push">Pushes</option>
            <option value="review">Reviews</option>
            <option value="merge">Merges</option>
          </select>

          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">Todos los proyectos</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.emoji} {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de actividades */}
      <div className="bg-white rounded-lg shadow">
        {activities.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">
                    {activity.projects?.emoji || '📁'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(activity.event_type)}`}>
                        {getEventTypeText(activity.event_type)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {activity.projects?.name}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {activity.title}
                    </h3>
                    
                    {activity.description && (
                      <p className="text-gray-600 text-sm mb-2">
                        {activity.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <span>Por</span>
                        <span className="font-medium">
                          {activity.users?.display_name || activity.users?.github_username || 'Usuario desconocido'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{formatDate(activity.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay actividades</h3>
            <p className="text-gray-500">
              {filterType !== 'all' || filterProject !== 'all' 
                ? 'No se encontraron actividades con los filtros seleccionados'
                : 'Las actividades aparecerán aquí cuando ocurran eventos en los proyectos'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;
