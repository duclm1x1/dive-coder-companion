-- First, delete any existing conversations/messages without user_id
-- (since we're about to make user_id NOT NULL)
DELETE FROM messages WHERE conversation_id IN (
  SELECT id FROM conversations WHERE user_id IS NULL
);
DELETE FROM conversations WHERE user_id IS NULL;

-- Make user_id required for conversations
ALTER TABLE conversations 
  ALTER COLUMN user_id SET NOT NULL;

-- Drop insecure policies
DROP POLICY IF EXISTS "Allow public access to conversations" ON conversations;
DROP POLICY IF EXISTS "Allow public access to messages" ON messages;
DROP POLICY IF EXISTS "Allow public read to workspaces" ON workspaces;
DROP POLICY IF EXISTS "Allow public read to skills" ON skills;

-- Conversations: Users can only access their own
CREATE POLICY "Users can access own conversations"
ON conversations FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Messages: Access through conversation ownership
CREATE POLICY "Users can access messages in own conversations"
ON messages FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND conversations.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND conversations.user_id = auth.uid()
  )
);

-- Workspaces: Allow public read, restrict writes to authenticated
CREATE POLICY "Anyone can read workspaces"
ON workspaces FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert workspaces"
ON workspaces FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update workspaces"
ON workspaces FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete workspaces"
ON workspaces FOR DELETE TO authenticated USING (true);

-- Skills: Public read only (admin manages via dashboard)
CREATE POLICY "Anyone can read skills"
ON skills FOR SELECT
USING (true);

CREATE POLICY "Block skill modifications"
ON skills FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY "Block skill updates"
ON skills FOR UPDATE TO authenticated USING (false);

CREATE POLICY "Block skill deletes"
ON skills FOR DELETE TO authenticated USING (false);