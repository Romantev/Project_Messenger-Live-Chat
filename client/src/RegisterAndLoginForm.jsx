import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext.jsx";
import axios from "axios";

export default function RegisterAndLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, seterrorMessage] = useState(false);
  const [isLoginOrRegister, setIsLoginOrRegister] = useState("register");
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

  useEffect(() => {
    if (password.length > 0 || confirmPassword > 0) {
      seterrorMessage(false);
    }
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoginOrRegister === "register") {
      if (password === confirmPassword) {
        const url = isLoginOrRegister === "register" ? "register" : "login";
        const { data } = await axios.post(`/api/${url}`, {
          username,
          password,
        });
        setLoggedInUsername(username);
        setId(data.id);
      } else {
        seterrorMessage(true);
      }
    }
  };

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        {isLoginOrRegister === "register" && (
          <input
            type="password"
            placeholder="confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full rounded-sm p-2 mb-2 border"
          />
        )}
        <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
          {isLoginOrRegister === "register" ? "Register" : "Login"}
        </button>
        <div className="text-center mt-2">
          {isLoginOrRegister === "register" && (
            <div className="flex flex-col">
              Already a member?
              <button
                onClick={() => setIsLoginOrRegister("login")}
                className="text-blue-500">
                Login here
              </button>
            </div>
          )}
          {errorMessage && (
            <h3 className="text-red-500">Password combination invalid</h3>
          )}
          {isLoginOrRegister === "login" && (
            <div className="flex flex-col">
              Don't have an account?
              <button
                onClick={() => setIsLoginOrRegister("register")}
                className="text-blue-500">
                Register here
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
