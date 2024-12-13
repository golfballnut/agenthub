-- competitors table
CREATE TABLE public.competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  website_url TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- conditions table
CREATE TABLE public.conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condition_name TEXT NOT NULL UNIQUE
);

-- Insert initial conditions
INSERT INTO public.conditions (condition_name) VALUES
  ('Prestige'), ('Mint'), ('Refinished'), ('NM'), ('AAA'), ('Practice');

-- competitor_condition_lookup table
CREATE TABLE public.competitor_condition_lookup (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competitor_id UUID REFERENCES public.competitors (id) ON DELETE CASCADE,
  condition_id UUID REFERENCES public.conditions (id) ON DELETE CASCADE,
  competitor_condition_name TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (competitor_id, condition_id)
);

-- competitor_product_match table
CREATE TABLE public.competitor_product_match (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID,
  competitor_id UUID REFERENCES public.competitors (id) ON DELETE CASCADE,
  product_page_url TEXT NOT NULL,
  ball_qty INTEGER,
  price NUMERIC(10,2),
  last_price_change TIMESTAMP WITH TIME ZONE,
  last_scraped TIMESTAMP WITH TIME ZONE,
  on_sale BOOLEAN DEFAULT false,
  promotion_details TEXT,
  daily_traffic INTEGER,
  daily_traffic_sources JSONB,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_condition_lookup ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_product_match ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ BEGIN
  CREATE POLICY "Enable read access for authenticated users"
    ON competitors FOR SELECT
    USING (auth.role() = 'authenticated');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Enable read access for authenticated users"
    ON conditions FOR SELECT
    USING (auth.role() = 'authenticated');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Enable read access for authenticated users"
    ON competitor_condition_lookup FOR SELECT
    USING (auth.role() = 'authenticated');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Enable read access for authenticated users"
    ON competitor_product_match FOR SELECT
    USING (auth.role() = 'authenticated');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS competitor_condition_lookup_competitor_id_idx 
  ON competitor_condition_lookup(competitor_id);
CREATE INDEX IF NOT EXISTS competitor_condition_lookup_condition_id_idx 
  ON competitor_condition_lookup(condition_id);
CREATE INDEX IF NOT EXISTS competitor_product_match_competitor_id_idx 
  ON competitor_product_match(competitor_id);
CREATE INDEX IF NOT EXISTS competitor_product_match_item_id_idx 
  ON competitor_product_match(item_id); 