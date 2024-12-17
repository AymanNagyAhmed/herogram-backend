export interface AuthUserData {
  id: number;
  email: string;
  name: string | null;
  status: string;
  role: string;
  profileImage: string | null;
}

export interface AuthResponse {
  user: AuthUserData;
  access_token: string;
}
