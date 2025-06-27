-- Temporarily disable any triggers that might be causing notification issues
-- when inserting into connections table

-- First, check and drop any existing notification triggers
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- Find all triggers on connections table
    FOR trigger_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'connections' 
        AND trigger_schema = 'public'
    LOOP
        -- Check if it's a notification-related trigger
        IF trigger_record.trigger_name LIKE '%notification%' OR 
           trigger_record.trigger_name LIKE '%notify%' THEN
            EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || ' ON connections';
            RAISE NOTICE 'Dropped trigger: %', trigger_record.trigger_name;
        END IF;
    END LOOP;
END $$;

-- Check if notifications table has user_id column and fix it
DO $$
BEGIN
    -- If user_id column exists in notifications, try to fix the schema
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        -- First, try to migrate data if possible
        BEGIN
            -- If recipient_id doesn't exist, create it
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'notifications' 
                AND column_name = 'recipient_id'
                AND table_schema = 'public'
            ) THEN
                ALTER TABLE notifications ADD COLUMN recipient_id UUID;
                -- Copy user_id to recipient_id if there's data
                UPDATE notifications SET recipient_id = user_id WHERE user_id IS NOT NULL;
            END IF;
            
            -- Drop the problematic user_id column
            ALTER TABLE notifications DROP COLUMN user_id CASCADE;
            
            RAISE NOTICE 'Successfully migrated notifications table schema';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not migrate notifications schema: %', SQLERRM;
        END;
    END IF;
END $$; 