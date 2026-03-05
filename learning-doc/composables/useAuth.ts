// composables/useAuth.ts
import { defineStore } from "pinia";
import { usePocketBase } from "~/services/pocketbase";

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar: string;
  image?: string;
  created: string;
  updated: string;
  status?: boolean;
  is_premium?: boolean;
}

export const useAuth = defineStore("auth", () => {
  const pb = usePocketBase();
  const user = ref<User | null>(pb.authStore.model as unknown as User);

  pb.authStore.onChange(() => {
    user.value = pb.authStore.model as unknown as User;
  });

  const login = async (email: string, pass: string) => {
    return await pb.collection("users_tbl").authWithPassword(email, pass);
  };

  const logout = () => {
    pb.authStore.clear();
    navigateTo("/auth/sign-in");
  };

  const register = async (data: any) => {
    return await pb.collection("users_tbl").create(data);
  };

  return {
    user,
    isLoggedIn: computed(() => !!user.value),
    login,
    logout,
    register,
  };
});
