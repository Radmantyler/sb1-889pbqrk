/*
  # Create regulations management tables

  1. New Tables
    - `regulations`
      - `id` (uuid, primary key)
      - `title` (text) - Title/name of the regulation
      - `chapter` (text) - Chapter number/identifier
      - `content` (text) - Full text content of the regulation
      - `version` (text) - Version/revision of the regulation
      - `effective_date` (date) - When this version became effective
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `is_active` (boolean) - Whether this is the current active version

  2. Security
    - Enable RLS on `regulations` table
    - Add policies for:
      - Public read access to active regulations
      - Authenticated users can create/update regulations
*/

CREATE TABLE regulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  chapter text NOT NULL,
  content text NOT NULL,
  version text NOT NULL,
  effective_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(chapter, version)
);

ALTER TABLE regulations ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active regulations
CREATE POLICY "Anyone can view active regulations"
  ON regulations
  FOR SELECT
  TO public
  USING (is_active = true);

-- Allow authenticated users to manage regulations
CREATE POLICY "Authenticated users can insert regulations"
  ON regulations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update regulations"
  ON regulations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_regulations_updated_at
  BEFORE UPDATE ON regulations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();