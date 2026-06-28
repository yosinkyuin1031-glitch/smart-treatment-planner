-- =============================================
-- メニュー提案管理アプリ - Supabase テーブル定義
-- =============================================

-- mp_menu_items: メニューアイテム
CREATE TABLE IF NOT EXISTS mp_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('施術系', '物販系', 'オプション系')),
  name TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  original_price INTEGER,
  duration INTEGER,
  unit TEXT DEFAULT '回',
  description TEXT,
  recommended BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  course_months INTEGER,
  course_price INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- mp_plan_sets: プランセット
CREATE TABLE IF NOT EXISTS mp_plan_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- mp_plans: プラン（プランセットの子要素）
CREATE TABLE IF NOT EXISTS mp_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_set_id UUID REFERENCES mp_plan_sets(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  is_recommended BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0
);

-- mp_plan_items: プランアイテム（プランの子要素）
CREATE TABLE IF NOT EXISTS mp_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES mp_plans(id) ON DELETE CASCADE NOT NULL,
  menu_item_id UUID REFERENCES mp_menu_items(id) ON DELETE SET NULL,
  menu_item_name TEXT NOT NULL,
  unit_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit TEXT DEFAULT '回',
  sort_order INTEGER DEFAULT 0
);

-- mp_proposals: 9セクション症状別提案書
CREATE TABLE IF NOT EXISTS mp_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  patient_name TEXT NOT NULL DEFAULT '',
  patient_age INTEGER,
  patient_gender TEXT,
  symptom_category TEXT NOT NULL DEFAULT 'その他',
  severity TEXT NOT NULL DEFAULT '中度',
  chief_complaint TEXT NOT NULL DEFAULT '',
  background TEXT NOT NULL DEFAULT '',
  observation TEXT NOT NULL DEFAULT '',
  special_notes TEXT NOT NULL DEFAULT '',
  plan_set_id UUID REFERENCES mp_plan_sets(id) ON DELETE SET NULL,
  sections JSONB NOT NULL DEFAULT '[]',
  slides JSONB NOT NULL DEFAULT '[]',
  theme_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 既存DB向けマイグレーション
ALTER TABLE mp_proposals ADD COLUMN IF NOT EXISTS slides JSONB NOT NULL DEFAULT '[]';
ALTER TABLE mp_proposals ADD COLUMN IF NOT EXISTS theme_key TEXT;

-- =============================================
-- インデックス
-- =============================================
CREATE INDEX IF NOT EXISTS idx_mp_menu_items_user_id ON mp_menu_items(user_id);
CREATE INDEX IF NOT EXISTS idx_mp_plan_sets_user_id ON mp_plan_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_mp_plans_plan_set_id ON mp_plans(plan_set_id);
CREATE INDEX IF NOT EXISTS idx_mp_plan_items_plan_id ON mp_plan_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_mp_proposals_user_id ON mp_proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_mp_proposals_created_at ON mp_proposals(user_id, created_at DESC);

-- =============================================
-- RLS (Row Level Security)
-- =============================================

-- mp_menu_items
ALTER TABLE mp_menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mp_menu_items_select" ON mp_menu_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "mp_menu_items_insert" ON mp_menu_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "mp_menu_items_update" ON mp_menu_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "mp_menu_items_delete" ON mp_menu_items
  FOR DELETE USING (auth.uid() = user_id);

-- mp_plan_sets
ALTER TABLE mp_plan_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mp_plan_sets_select" ON mp_plan_sets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "mp_plan_sets_insert" ON mp_plan_sets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "mp_plan_sets_update" ON mp_plan_sets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "mp_plan_sets_delete" ON mp_plan_sets
  FOR DELETE USING (auth.uid() = user_id);

-- mp_plans (user_idはplan_sets経由で判定)
ALTER TABLE mp_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mp_plans_select" ON mp_plans
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM mp_plan_sets WHERE mp_plan_sets.id = mp_plans.plan_set_id AND mp_plan_sets.user_id = auth.uid())
  );

CREATE POLICY "mp_plans_insert" ON mp_plans
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM mp_plan_sets WHERE mp_plan_sets.id = mp_plans.plan_set_id AND mp_plan_sets.user_id = auth.uid())
  );

CREATE POLICY "mp_plans_update" ON mp_plans
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM mp_plan_sets WHERE mp_plan_sets.id = mp_plans.plan_set_id AND mp_plan_sets.user_id = auth.uid())
  );

CREATE POLICY "mp_plans_delete" ON mp_plans
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM mp_plan_sets WHERE mp_plan_sets.id = mp_plans.plan_set_id AND mp_plan_sets.user_id = auth.uid())
  );

-- mp_plan_items (user_idはplans→plan_sets経由で判定)
ALTER TABLE mp_plan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mp_plan_items_select" ON mp_plan_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mp_plans
      JOIN mp_plan_sets ON mp_plan_sets.id = mp_plans.plan_set_id
      WHERE mp_plans.id = mp_plan_items.plan_id AND mp_plan_sets.user_id = auth.uid()
    )
  );

CREATE POLICY "mp_plan_items_insert" ON mp_plan_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM mp_plans
      JOIN mp_plan_sets ON mp_plan_sets.id = mp_plans.plan_set_id
      WHERE mp_plans.id = mp_plan_items.plan_id AND mp_plan_sets.user_id = auth.uid()
    )
  );

CREATE POLICY "mp_plan_items_update" ON mp_plan_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM mp_plans
      JOIN mp_plan_sets ON mp_plan_sets.id = mp_plans.plan_set_id
      WHERE mp_plans.id = mp_plan_items.plan_id AND mp_plan_sets.user_id = auth.uid()
    )
  );

CREATE POLICY "mp_plan_items_delete" ON mp_plan_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM mp_plans
      JOIN mp_plan_sets ON mp_plan_sets.id = mp_plans.plan_set_id
      WHERE mp_plans.id = mp_plan_items.plan_id AND mp_plan_sets.user_id = auth.uid()
    )
  );

-- mp_proposals
ALTER TABLE mp_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mp_proposals_select" ON mp_proposals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "mp_proposals_insert" ON mp_proposals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "mp_proposals_update" ON mp_proposals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "mp_proposals_delete" ON mp_proposals
  FOR DELETE USING (auth.uid() = user_id);
