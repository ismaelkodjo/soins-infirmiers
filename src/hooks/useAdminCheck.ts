import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useAdminCheck = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const checkedRef = useRef(false);

  useEffect(() => {
    // Reset when user changes
    checkedRef.current = false;
    setLoading(true);
    setIsAdmin(false);

    if (authLoading) return;

    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const check = async () => {
      try {
        const { data, error } = await supabase.rpc("has_role" as any, {
          _user_id: user.id,
          _role: "admin",
        });
        if (!checkedRef.current) {
          checkedRef.current = true;
          setIsAdmin(error ? false : !!data);
          setLoading(false);
        }
      } catch {
        if (!checkedRef.current) {
          checkedRef.current = true;
          setIsAdmin(false);
          setLoading(false);
        }
      }
    };

    check();
  }, [user?.id, authLoading]);

  return { isAdmin, loading };
};
