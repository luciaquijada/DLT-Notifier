import React from 'react';
import { Users, Folder, Activity, Bell } from 'lucide-react';

const Navigation = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Activity },
    { id: 'users', name: 'Usuarios', icon: Users },
    { id: 'projects', name: 'Proyectos', icon: Folder },
    { id: 'activities', name: 'Actividades', icon: Bell },
  ];

  return (
    <nav className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">🔔 GitHub Notifier</h1>
        <p className="text-gray-400 text-sm">Dashboard de Control</p>
      </div>
      
      <ul className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <button
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navigation;
