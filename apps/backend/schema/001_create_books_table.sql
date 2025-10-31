CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.bookhunt_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(50) DEFAULT 'draft' NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  description TEXT,
  cover_url TEXT,
  published_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp ON public.bookhunt_books;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.bookhunt_books
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
