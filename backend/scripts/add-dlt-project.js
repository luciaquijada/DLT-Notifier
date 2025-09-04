const { supabase } = require('../config/supabase');

async function addDLTProject() {
  try {
    console.log('🚀 Agregando proyecto DLT-Notifier...');
    
    // Primero verificar si el usuario existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('github_username', 'luciaquijada')
      .maybeSingle();

    if (userError) {
      console.error('Error buscando usuario:', userError);
      return;
    }

    if (!user) {
      console.log('👤 Creando usuario luciaquijada...');
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert([{
          github_username: 'luciaquijada',
          slack_user_id: 'U092NLECWCB',
          display_name: 'Lucia Quijada',
          is_active: true
        }])
        .select()
        .single();

      if (createUserError) {
        console.error('Error creando usuario:', createUserError);
        return;
      }
      console.log('✅ Usuario creado:', newUser.github_username);
    } else {
      console.log('✅ Usuario encontrado:', user.github_username);
    }

    // Verificar si el proyecto ya existe
    const { data: existingProject, error: projectCheckError } = await supabase
      .from('projects')
      .select('*')
      .eq('github_repo', 'luciaquijada/DLT-Notifier')
      .maybeSingle();

    if (projectCheckError) {
      console.error('Error verificando proyecto:', projectCheckError);
      return;
    }

    if (existingProject) {
      console.log('✅ Proyecto DLT-Notifier ya existe');
      return;
    }

    // Crear el proyecto
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert([{
        name: 'DLT-Notifier',
        github_repo: 'luciaquijada/DLT-Notifier',
        description: 'Sistema de notificaciones de GitHub a Slack para DLT',
        emoji: '🔔',
        is_active: true
      }])
      .select()
      .single();

    if (projectError) {
      console.error('Error creando proyecto:', projectError);
      return;
    }

    console.log('✅ Proyecto creado:', project.name);

    // Relacionar el usuario con el proyecto
    const currentUser = user || newUser;
    const { error: relationError } = await supabase
      .from('project_users')
      .insert([{
        project_id: project.id,
        user_id: currentUser.id,
        role: 'admin',
        notify_on_pr: true,
        notify_on_push: false
      }]);

    if (relationError) {
      console.error('Error relacionando usuario con proyecto:', relationError);
      return;
    }

    console.log('✅ Usuario relacionado con el proyecto');
    console.log('🎉 Proyecto DLT-Notifier configurado exitosamente');

  } catch (error) {
    console.error('❌ Error agregando proyecto DLT-Notifier:', error);
  }
}

if (require.main === module) {
  addDLTProject();
}

module.exports = { addDLTProject };
