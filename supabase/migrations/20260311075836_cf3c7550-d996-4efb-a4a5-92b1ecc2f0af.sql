
-- Table: pharmacy inventory (medications & medical supplies)
CREATE TABLE public.pharmacy_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'medicament',
  description TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'unité',
  min_stock INTEGER NOT NULL DEFAULT 5,
  price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: pharmacy waiting list (from prescriptions/lab requests)
CREATE TABLE public.pharmacy_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  patient_name TEXT NOT NULL DEFAULT '',
  source_type TEXT NOT NULL DEFAULT 'ordonnance',
  source_id UUID,
  items TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'en attente',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pharmacy_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies for pharmacy_items
CREATE POLICY "Admins can manage pharmacy items" ON public.pharmacy_items FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Approved staff can view pharmacy items" ON public.pharmacy_items FOR SELECT TO authenticated USING (is_approved_staff(auth.uid()));

-- RLS policies for pharmacy_queue
CREATE POLICY "Admins can manage pharmacy queue" ON public.pharmacy_queue FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Approved staff can view pharmacy queue" ON public.pharmacy_queue FOR SELECT TO authenticated USING (is_approved_staff(auth.uid()));
CREATE POLICY "Approved staff can insert pharmacy queue" ON public.pharmacy_queue FOR INSERT TO authenticated WITH CHECK (is_approved_staff(auth.uid()));
CREATE POLICY "Approved staff can update pharmacy queue" ON public.pharmacy_queue FOR UPDATE TO authenticated USING (is_approved_staff(auth.uid()));

-- Trigger: auto-create pharmacy queue entry when ordonnance is created
CREATE OR REPLACE FUNCTION public.handle_ordonnance_to_pharmacy()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  p_name TEXT;
BEGIN
  SELECT display_name INTO p_name FROM public.profiles WHERE user_id = NEW.patient_id LIMIT 1;
  INSERT INTO public.pharmacy_queue (patient_id, patient_name, source_type, source_id, items)
  VALUES (NEW.patient_id, COALESCE(p_name, 'Patient'), 'ordonnance', NEW.id, NEW.medications);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_ordonnance_created
  AFTER INSERT ON public.ordonnances
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_ordonnance_to_pharmacy();

-- Trigger: auto-create pharmacy queue entry when lab result is created
CREATE OR REPLACE FUNCTION public.handle_lab_to_pharmacy()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  p_name TEXT;
BEGIN
  SELECT display_name INTO p_name FROM public.profiles WHERE user_id = NEW.patient_id LIMIT 1;
  INSERT INTO public.pharmacy_queue (patient_id, patient_name, source_type, source_id, items)
  VALUES (NEW.patient_id, COALESCE(p_name, 'Patient'), 'analyse', NEW.id, ARRAY[NEW.test_name]);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_lab_result_created
  AFTER INSERT ON public.lab_results
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_lab_to_pharmacy();

-- Updated_at triggers
CREATE TRIGGER update_pharmacy_items_updated_at BEFORE UPDATE ON public.pharmacy_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pharmacy_queue_updated_at BEFORE UPDATE ON public.pharmacy_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
