import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { URLs } from "../router/router.scheme";
import useUserStore from "../../entity/user/user.store";

const AuthWrapper = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate(URLs.LOGIN);
    }
  }, [user, navigate]);

  return <Outlet />;
};

export default AuthWrapper;