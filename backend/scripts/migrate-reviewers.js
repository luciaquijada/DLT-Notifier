require('dotenv').config();
const { supabase } = require('../config/supabase');
const fs = require('fs');
const path = require('path');

async function migrateFromReviewersJson() {
  try {
    console.log('🔄 Migrando datos desde reviewers.json...');
    
    // Leer el archivo reviewers.json actual
    const reviewersPath = path.join(__dirname, '../../reviewers.json');
    const reviewersData = JSON.parse(fs.readFileSync(reviewersPath, 'utf8'));
    
    console.log('📄 Datos encontrados:', reviewersData);
    
    // Procesar cada repositorio
    for (const [repoName, repoData] of Object.entries(reviewersData)) {
      console.log(`\n📁 Procesando repositorio: ${repoName}`);
      
      // 1. Crear o actualizar el proyecto
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .upsert({
          name: repoName.split('/')[1], // Tomar solo el nombre del repo
          github_repo: repoName,
          description: `Proyecto migrado automáticamente desde reviewers.json`,
          emoji: '🔔', // Emoji por defecto
          is_active: true
        }, {
          onConflict: 'github_repo'
        })
        .select()
        .single();
      
      if (projectError) {
        console.error(`❌ Error creando proyecto ${repoName}:`, projectError);
        continue;
      }
      
      console.log(`✅ Proyecto creado/actualizado: ${project.name}`);
      
      // 2. Crear o actualizar usuarios
      if (repoData.usuarios) {
        for (const [githubUsername, slackUserId] of Object.entries(repoData.usuarios)) {
          console.log(`👤 Procesando usuario: ${githubUsername} -> ${slackUserId}`);
          
          // Crear/actualizar usuario
          const { data: user, error: userError } = await supabase
            .from('users')
            .upsert({
              github_username: githubUsername,
              slack_user_id: slackUserId,
              display_name: githubUsername, // Por defecto, usar el username
              is_active: true
            }, {
              onConflict: 'github_username'
            })
            .select()
            .single();
          
          if (userError) {
            console.error(`❌ Error creando usuario ${githubUsername}:`, userError);
            continue;
          }
          
          console.log(`✅ Usuario creado/actualizado: ${user.github_username}`);
          
          // 3. Relacionar usuario con proyecto
          const { error: relationError } = await supabase
            .from('project_users')
            .upsert({
              project_id: project.id,
              user_id: user.id,
              role: 'reviewer',
              notify_on_pr: true,
              notify_on_push: false // Por defecto, solo PRs
            }, {
              onConflict: 'project_id,user_id'
            });
          
          if (relationError) {
            console.error(`❌ Error relacionando usuario ${githubUsername} con proyecto:`, relationError);
          } else {
            console.log(`🔗 Usuario ${githubUsername} vinculado al proyecto`);
          }
        }
      }
    }
    
    console.log('\n🎉 Migración completada exitosamente!');
    
    // Mostrar resumen
    const { data: usersCount } = await supabase
      .from('users')
      .select('id', { count: 'exact' });
    
    const { data: projectsCount } = await supabase
      .from('projects')
      .select('id', { count: 'exact' });
    
    console.log(`\n📊 Resumen:`);
    console.log(`- Usuarios: ${usersCount.length}`);
    console.log(`- Proyectos: ${projectsCount.length}`);
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  }
}

if (require.main === module) {
  migrateFromReviewersJson();
}

module.exports = { migrateFromReviewersJson };
