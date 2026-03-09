CREATE TRIGGER on_appointment_status_change
  AFTER UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_appointment_status_change();