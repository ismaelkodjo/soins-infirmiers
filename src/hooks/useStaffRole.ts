import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type StaffRole =
  | "medecin"
  | "infirmier_diplome"
  | "sage_femme"
  | "technicien_labo"
  | "infirmier_auxiliaire"
  | "accoucheuse_auxiliaire"
  | "pharmacien";

const MEDICAL_ROLES: StaffRole[] = [
  "medecin",
  "infirmier_diplome",
  "sage_femme",
  "infirmier_auxiliaire",
  "accoucheuse_auxiliaire",
];

export const ROLE_LABELS: Record<StaffRole, string> = {
  medecin: "Médecin",
  infirmier_diplome: "Infirmier(e) diplômé(e) d'État",
  sage_femme: "Sage-femme d'État",
  technicien_labo: "Technicien supérieur de laboratoire",
  infirmier_auxiliaire: "Infirmier(e) auxiliaire d'État",
  accoucheuse_auxiliaire: "Accoucheuse auxiliaire d'État",
  pharmacien: "Gérant(e) de pharmacie",
};

export const useStaffRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<StaffRole | null>(null);
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRole(null);
      setApproved(false);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        const { data, error } = await supabase
          .from("staff_members")
          .select("role, approved")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setRole(data.role as StaffRole);
          setApproved(data.approved);
        } else {
          setRole(null);
          setApproved(false);
        }
      } catch {
        setRole(null);
        setApproved(false);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user?.id, authLoading]);

  const isMedicalStaff = role ? MEDICAL_ROLES.includes(role) : false;
  const isLabTech = role === "technicien_labo";
  const isPharmacist = role === "pharmacien";

  return { role, approved, loading, isMedicalStaff, isLabTech, isPharmacist };
};
