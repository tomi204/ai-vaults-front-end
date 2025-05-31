import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// Utility function to insert a new vault into Supabase
export const insertVault = async (vaultData: {
  vaultaddress: string;
  blockchain: string;
  nombre: string;
  symbol: string;
}) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("vaults")
    .insert([vaultData])
    .select("*");

  if (error) {
    console.error("Error inserting vault:", error);
    throw error;
  }

  return data;
};

// Utility function to get all vaults
export const getVaults = async () => {
  const supabase = createClient();

  const { data: vaults, error } = await supabase.from("vaults").select("*");

  if (error) {
    console.error("Error fetching vaults:", error);
    throw error;
  }

  return vaults;
};

// Utility function to get vaults by blockchain
export const getVaultsByBlockchain = async (blockchain: string) => {
  const supabase = createClient();

  const { data: vaults, error } = await supabase
    .from("vaults")
    .select("*")
    .eq("blockchain", blockchain);

  if (error) {
    console.error("Error fetching vaults by blockchain:", error);
    throw error;
  }

  return vaults;
};
