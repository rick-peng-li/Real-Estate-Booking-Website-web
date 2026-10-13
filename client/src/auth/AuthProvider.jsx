import React, { createContext, useContext, useState } from "react";
import { Modal, Button, TextInput, PasswordInput, Text } from "@mantine/core";
import { toast } from "react-toastify";
import { api } from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("auth_user") || "null")
  );
  const [token, setToken] = useState(() =>
    localStorage.getItem("access_token")
  );
  const [modalOpened, setModalOpened] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const saveSession = (data) => {
    localStorage.setItem("access_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const handleSubmit = async () => {
    if (!email || !password || (isRegister && !name)) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post(
        isRegister ? "/auth/register" : "/auth/login",
        isRegister ? { name, email, password } : { email, password }
      );
      saveSession(data);
      setModalOpened(false);
      setName("");
      setEmail("");
      setPassword("");
      toast.success(isRegister ? "Account created" : "Logged in", {
        position: "bottom-right",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(user && token),
        user,
        token,
        logout,
        loginWithRedirect: () => setModalOpened(true),
        getAccessTokenWithPopup: async () => token,
      }}
    >
      {children}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={isRegister ? "Create account" : "Login"}
        centered
      >
        <div className="flexColCenter" style={{ gap: "1rem" }}>
          {isRegister && (
            <TextInput
              label="Name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%" }}
            />
          )}
          <TextInput
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%" }}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%" }}
          />
          <Button loading={loading} onClick={handleSubmit}>
            {isRegister ? "Sign up" : "Login"}
          </Button>
          <Text
            size="sm"
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => setIsRegister((prev) => !prev)}
          >
            {isRegister
              ? "Already have an account? Login"
              : "No account yet? Sign up"}
          </Text>
        </div>
      </Modal>
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
