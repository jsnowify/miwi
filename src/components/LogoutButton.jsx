import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Button
      onClick={handleLogout}
      variant="ghost"
      className="text-xs text-[#8C8481] hover:text-[#E5735B] hover:bg-transparent"
    >
      Logout
    </Button>
  );
}
