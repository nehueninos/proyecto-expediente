/*
  # Expedientes Management System

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - References auth.users
      - `username` (text, unique) - User's username
      - `name` (text) - Full name
      - `area` (text) - User's department/area
      - `created_at` (timestamptz) - Account creation timestamp
    
    - `expedientes`
      - `id` (uuid, primary key) - Unique identifier
      - `numero` (text, unique) - Expediente number
      - `titulo` (text) - Title/subject
      - `descripcion` (text) - Description
      - `area` (text) - Current area/department
      - `estado` (text) - Status: 'pendiente', 'en_proceso', 'resuelto'
      - `prioridad` (text) - Priority: 'baja', 'media', 'alta'
      - `user_id` (uuid) - Current owner (references users)
      - `created_by` (uuid) - Original creator (references users)
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `expediente_history`
      - `id` (uuid, primary key) - Unique identifier
      - `expediente_id` (uuid) - Reference to expediente
      - `from_area` (text) - Source area
      - `to_area` (text) - Destination area
      - `from_user_id` (uuid) - User who transferred
      - `to_user_id` (uuid) - User who received
      - `observaciones` (text) - Transfer notes
      - `created_at` (timestamptz) - Transfer timestamp

  2. Security
    - Enable RLS on all tables
    - Users can read their own profile and other users' names/areas
    - Users can view expedientes in their area
    - Users can create expedientes
    - Users can view history of expedientes they own or created

  3. Important Notes
    - Users table extends auth.users with profile information
    - Expedientes track ownership and creation separately
    - History records all transfers for audit trail
*/

-- Users profile table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  name text NOT NULL,
  area text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read all user profiles (for transfers and lookups)
CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Expedientes table
CREATE TABLE IF NOT EXISTS expedientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text UNIQUE NOT NULL,
  titulo text NOT NULL,
  descripcion text DEFAULT '',
  area text NOT NULL,
  estado text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'resuelto')),
  prioridad text NOT NULL DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta')),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE expedientes ENABLE ROW LEVEL SECURITY;

-- Users can view expedientes in their area
CREATE POLICY "Users can view expedientes in their area"
  ON expedientes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.area = expedientes.area
    )
  );

-- Users can create expedientes
CREATE POLICY "Users can create expedientes"
  ON expedientes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() = created_by
  );

-- Users can update expedientes in their area
CREATE POLICY "Users can update expedientes in their area"
  ON expedientes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.area = expedientes.area
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.area = expedientes.area
    )
  );

-- Expediente history table
CREATE TABLE IF NOT EXISTS expediente_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id uuid NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
  from_area text NOT NULL,
  to_area text NOT NULL,
  from_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  observaciones text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expediente_history ENABLE ROW LEVEL SECURITY;

-- Users can view history of expedientes in their area
CREATE POLICY "Users can view expediente history"
  ON expediente_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expedientes
      WHERE expedientes.id = expediente_history.expediente_id
      AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.area = expedientes.area
      )
    )
  );

-- Users can insert history when transferring
CREATE POLICY "Users can create history entries"
  ON expediente_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expedientes_user_id ON expedientes(user_id);
CREATE INDEX IF NOT EXISTS idx_expedientes_area ON expedientes(area);
CREATE INDEX IF NOT EXISTS idx_expedientes_estado ON expedientes(estado);
CREATE INDEX IF NOT EXISTS idx_expediente_history_expediente_id ON expediente_history(expediente_id);