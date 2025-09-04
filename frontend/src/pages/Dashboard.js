import React, { useState, useEffect } from 'react';
import { Users, Folder, Activity, TrendingUp } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalActivities: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener estadísticas
      const [usersResult, projectsResult, activitiesResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('projects').select('id', { count: 'exact' }),
        supabase.from('activities').select('id', { count: 'exact' })
      ]);

      // Obtener actividades recientes
      const recentActivitiesResult = await supabase
        .from('activities')
        .select(`
          *,
          projects(name, emoji),
          users(github_username, display_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalUsers: usersResult.count || 0,
        totalProjects: projectsResult.count || 0,
        totalActivities: activitiesResult.count || 0,
        recentActivities: recentActivitiesResult.data || []
      });
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Vista general del sistema de notificaciones</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Usuarios"
          value={stats.totalUsers}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Proyectos"
          value={stats.totalProjects}
          icon={Folder}
          color="bg-green-500"
        />
        <StatCard
          title="Total Actividades"
          value={stats.totalActivities}
          icon={Activity}
          color="bg-purple-500"
        />
        <StatCard
          title="Crecimiento"
          value="+12%"
          icon={TrendingUp}
          color="bg-orange-500"
        />
      </div>

      {/* Actividades recientes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Actividades Recientes</h2>
        </div>
        <div className="p-6">
          {stats.recentActivities.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl">
                    {activity.projects?.emoji || '📁'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {activity.projects?.name} • {activity.users?.display_name || activity.users?.github_username}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No hay actividades recientes
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
