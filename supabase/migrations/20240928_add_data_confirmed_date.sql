-- Add data_confirmed_date column to settings table
-- This column tracks when the user has confirmed today's data is ready
-- Format: YYYY-MM-DD (WIB timezone)

ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS data_confirmed_date DATE;

-- Create a trigger to automatically update updated_at timestamp
-- This ensures updated_at is refreshed on every update

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists (to avoid duplicates)
DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;

-- Create the trigger
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Comment to document the purpose
COMMENT ON COLUMN public.settings.data_confirmed_date IS 'Tanggal terakhir konfirmasi bahwa data pagi sudah siap (format: YYYY-MM-DD, WIB)';