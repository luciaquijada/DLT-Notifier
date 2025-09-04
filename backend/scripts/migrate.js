const { supabaseAdmin } = require('../config/supabase');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🚀 Ejecutando migración de la base de datos...');
    
    // Leer el archivo SQL
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Ejecutar las migraciones
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error('❌ Error en la migración:', error);
      process.exit(1);
    }
    
    console.log('✅ Migración completada exitosamente');
    
    // Insertar datos de ejemplo
    await insertSampleData();
    
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    process.exit(1);
  }
}

async function insertSampleData() {
  console.log('📊 Insertando datos de ejemplo...');
  
  try {
    // Insertar usuarios de ejemplo basados en tu reviewers.json actual
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .upsert([
        {
          github_username: 'luciaquijada',
          slack_user_id: 'U092NLECWCB',
          display_name: 'Lucia Quijada',
          is_active: true
        },
        {
          github_username: 'quijadatech',
          slack_user_id: 'U093J5WTDH6', 
          display_name: 'Quijada Tech',
          is_active: true
        }
      ], {
        onConflict: 'github_username'
      })
      .select();

    if (usersError) {
      console.error('Error insertando usuarios:', usersError);
      return;
    }

    // Insertar proyecto de ejemplo
    const { data: projects, error: projectsError } = await supabaseAdmin
      .from('projects')
      .upsert([
        {
          name: 'GitHub Notifier',
          github_repo: 'luciaquijada/GitHub-Notifier',
          description: 'Sistema de notificaciones de GitHub a Slack',
          emoji: '🔔',
          is_active: true
        }
      ], {
        onConflict: 'github_repo'
      })
      .select();

    if (projectsError) {
      console.error('Error insertando proyectos:', projectsError);
      return;
    }

    // Relacionar usuarios con el proyecto
    if (users && projects && users.length > 0 && projects.length > 0) {
      const projectId = projects[0].id;
      
      const { error: relationError } = await supabaseAdmin
        .from('project_users')
        .upsert(
          users.map(user => ({
            project_id: projectId,
            user_id: user.id,
            role: user.github_username === 'luciaquijada' ? 'admin' : 'reviewer',
            notify_on_pr: true
          })), {
            onConflict: 'project_id,user_id'
          }
        );

      if (relationError) {
        console.error('Error relacionando usuarios con proyecto:', relationError);
        return;
      }
    }

    console.log('✅ Datos de ejemplo insertados');
    
  } catch (error) {
    console.error('❌ Error insertando datos de ejemplo:', error);
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = { runMigration, insertSampleData };
