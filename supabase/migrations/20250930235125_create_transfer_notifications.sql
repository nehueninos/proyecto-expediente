/*
  # Transfer Notifications System

  1. New Tables
    - `transfer_notifications`
      - `id` (uuid, primary key) - Unique identifier for each notification
      - `expediente_id` (uuid) - Reference to the expediente being transferred
      - `from_user_id` (uuid) - User initiating the transfer
      - `to_user_id` (uuid) - User receiving the transfer request
      - `to_area` (text) - Destination area
      - `status` (text) - Status: 'pending', 'accepted', 'rejected'
      - `message` (text) - Optional message for the transfer
      - `created_at` (timestamptz) - When the notification was created
      - `updated_at` (timestamptz) - When the notification was last updated

  2. Security
    - Enable RLS on `transfer_notifications` table
    - Add policy for users to view their own notifications (sent or received)
    - Add policy for users to create transfer notifications
    - Add policy for recipients to update notification status

  3. Important Notes
    - When a transfer is accepted, the expediente's user_id and area will be updated
    - When rejected, the notification status changes but expediente stays with original user
    - Only pending notifications are shown to users
    - Notifications create history entries when accepted
*/

CREATE TABLE IF NOT EXISTS transfer_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id uuid NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
  from_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_area text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transfer_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view notifications where they are sender or recipient
CREATE POLICY "Users can view own notifications"
  ON transfer_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Users can create transfer notifications for expedientes in their area
CREATE POLICY "Users can create transfer notifications"
  ON transfer_notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = from_user_id AND
    EXISTS (
      SELECT 1 FROM expedientes
      WHERE expedientes.id = transfer_notifications.expediente_id
      AND expedientes.user_id = auth.uid()
    )
  );

-- Recipients can update notification status
CREATE POLICY "Recipients can update notification status"
  ON transfer_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = to_user_id)
  WITH CHECK (auth.uid() = to_user_id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transfer_notifications_to_user 
  ON transfer_notifications(to_user_id, status);

CREATE INDEX IF NOT EXISTS idx_transfer_notifications_from_user 
  ON transfer_notifications(from_user_id, status);

CREATE INDEX IF NOT EXISTS idx_transfer_notifications_expediente 
  ON transfer_notifications(expediente_id);