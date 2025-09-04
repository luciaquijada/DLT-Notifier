const { supabase } = require('../config/supabase');

async function checkTableStructure() {
  try {
    console.log('🔍 Checking activities table structure...');
    
    // Try to select all columns from activities table to see what exists
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error querying activities table:', error);
      return;
    }

    console.log('✅ Successfully queried activities table');
    
    // Try to insert a minimal test record
    const testData = {
      project_id: '00000000-0000-0000-0000-000000000000', // fake UUID for test
      event_type: 'test',
      event_data: { test: true }
    };

    const { data: insertData, error: insertError } = await supabase
      .from('activities')
      .insert([testData])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting test data:', insertError);
    } else {
      console.log('✅ Test insert successful');
      
      // Clean up test data
      await supabase
        .from('activities')
        .delete()
        .eq('id', insertData.id);
      
      console.log('✅ Test data cleaned up');
    }

  } catch (error) {
    console.error('❌ Error checking table structure:', error);
  }
}

if (require.main === module) {
  checkTableStructure();
}

module.exports = { checkTableStructure };
