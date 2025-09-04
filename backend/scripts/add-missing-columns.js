const { supabase } = require('../config/supabase');

async function addMissingColumns() {
  try {
    console.log('🔧 Checking and adding missing columns to activities table...');
    
    // Try to add branch_name column if it doesn't exist
    const { error: branchNameError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'activities' AND column_name = 'branch_name'
          ) THEN
            ALTER TABLE activities ADD COLUMN branch_name VARCHAR(255);
            RAISE NOTICE 'Added branch_name column to activities table';
          ELSE
            RAISE NOTICE 'branch_name column already exists in activities table';
          END IF;
        END $$;
      `
    });

    if (branchNameError) {
      console.error('Error adding branch_name column:', branchNameError);
    } else {
      console.log('✅ branch_name column check completed');
    }

    // Check other columns that might be missing
    const { error: otherColumnsError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN 
          -- Add pr_number if missing
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'activities' AND column_name = 'pr_number'
          ) THEN
            ALTER TABLE activities ADD COLUMN pr_number INTEGER;
            RAISE NOTICE 'Added pr_number column to activities table';
          END IF;

          -- Add pr_title if missing
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'activities' AND column_name = 'pr_title'
          ) THEN
            ALTER TABLE activities ADD COLUMN pr_title TEXT;
            RAISE NOTICE 'Added pr_title column to activities table';
          END IF;

          -- Add pr_url if missing
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'activities' AND column_name = 'pr_url'
          ) THEN
            ALTER TABLE activities ADD COLUMN pr_url TEXT;
            RAISE NOTICE 'Added pr_url column to activities table';
          END IF;

          -- Add commit_sha if missing
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'activities' AND column_name = 'commit_sha'
          ) THEN
            ALTER TABLE activities ADD COLUMN commit_sha VARCHAR(255);
            RAISE NOTICE 'Added commit_sha column to activities table';
          END IF;

          -- Add github_event_id if missing
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'activities' AND column_name = 'github_event_id'
          ) THEN
            ALTER TABLE activities ADD COLUMN github_event_id VARCHAR(255);
            RAISE NOTICE 'Added github_event_id column to activities table';
          END IF;
        END $$;
      `
    });

    if (otherColumnsError) {
      console.error('Error adding other columns:', otherColumnsError);
    } else {
      console.log('✅ All columns check completed');
    }

    console.log('🎉 Migration completed successfully');

  } catch (error) {
    console.error('❌ Error in migration:', error);
  }
}

if (require.main === module) {
  addMissingColumns();
}

module.exports = { addMissingColumns };
