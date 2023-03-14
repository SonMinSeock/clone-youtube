import User from "../models/User";
import Video from "../models/Video";
import bcrypt from "bcrypt";
import fetch from "node-fetch";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  const { email, username, password, password2, name, location } = req.body;
  const pageTitle = "Join";

  // 입력한 패스워드가 맞는지 확인
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }

  // 입력한 username이 이미 사용중인지 확인 할것.
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username or email is already taken.",
    });
  }

  try {
    await User.create({
      email,
      password,
      username,
      name,
      location,
    });
    res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
};
export const getLogin = (req, res) => {
  res.render("login", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  // check if account exists.
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle: "Login",
      errorMessage: "An Account with this username does not exists. ",
    });
  }
  // check if password correct.
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle: "Login",
      errorMessage: "Wrong Password",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = `https://github.com/login/oauth/authorize`;
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_singup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };

  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  if ("access_token" in tokenRequest) {
    // access api
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );

    if (!emailObj) {
      return res.redirect("/login");
    }
    // !!!! primary이면서 verified인 email이 있다는 뜻이다.
    let user = await User.findOne({ email: emailObj.email });

    if (!user) {
      user = await User.create({
        email: emailObj.email,
        password: "",
        socialOnly: true,
        username: userData.login,
        name: userData.name,
        location: userData.location,
        avatarUrl: userData.avatar_url,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

// kakao login
export const startKakaoLogin = (req, res) => {
  const baseUrl = "https://kauth.kakao.com/oauth/authorize";
  const config = {
    client_id: "6b6c7b0bc06af6815119ea637762e914",
    redirect_uri:
      "https://port-0-clone-youtube-nx562olf43veth.sel3.cloudtype.app/users/kakao/finish",
  };

  const params = new URLSearchParams(config).toString();

  const finalUrl = `${baseUrl}?response_type=code&client_id=6b6c7b0bc06af6815119ea637762e914&redirect_uri=https://port-0-clone-youtube-nx562olf43veth.sel3.cloudtype.app/users/kakao/finish`;

  return res.redirect(finalUrl);
};

export const finishKakoLogin = async (req, res) => {
  const { code } = req.query;

  const config = {
    client_id: "6b6c7b0bc06af6815119ea637762e914",
    redirect_uri:
      "https://port-0-clone-youtube-nx562olf43veth.sel3.cloudtype.app/users/kakao/finish",
    code,
    grant_type: "authorization_code",
  };

  const baseUrl = "https://kauth.kakao.com/oauth/token";

  const params = new URLSearchParams(config).toString();

  const finalUrl = `${baseUrl}?redirect_uri=https://port-0-clone-youtube-nx562olf43veth.sel3.cloudtype.app/users/kakao/finish&scope=account_email profile_nickname profile_image`;

  const data = await fetch(finalUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  const json = await data.json();

  if ("access_token" in json) {
    const { access_token } = json;

    const apiUrl = "https://kapi.kakao.com";

    const userData = await (
      await fetch(`${apiUrl}/v2/user/me`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();

    if (!userData) {
      return res.redirect("/login");
    }

    let user = await User.findOne({ email: userData.kakao_account.email });

    if (!user) {
      user = await User.create({
        email: userData.kakao_account.email,
        password: "",
        username: userData.kakao_account.profile.nickname,
        name: userData.kakao_account.profile.nickname,
        location: "",
        socialOnly: true,
        avatarUrl: userData.kakao_account.profile.profile_image_url,
      });
    }

    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.user = null;
  req.session.loggedIn = false;
  req.flash("info", "Bye Bye");

  return res.redirect("/");
};

export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email, username, location },
    file,
  } = req;

  const findUsername = await User.findOne({ username });
  const findEmail = await User.findOne({ email });

  if (findUsername._id != _id || findEmail._id != _id) {
    console.log("username 혹은 email을 사용하고 있습니다.");
    return res.redirect("/users/edit");
  }

  const updateUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      email,
      username,
      location,
    },
    { new: true }
  );

  console.log("updateUser : ", updateUser);
  req.session.user = updateUser;
  return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly) {
    req.flash("error", "Can't change password.");

    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;

  // password validaition
  const user = await User.findById(_id);

  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect",
    });
  }
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password does not match the confirmation",
    });
  }
  // upload password
  user.password = newPassword;
  // pre sace middleware 동작.
  await user.save();

  req.flash("info", "Password updated");
  // send nontification
  return res.redirect("/users/logout");
};

export const see = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  console.log("see : ", typeof req.session.user._id);
  const user = await User.findById(req.session.user._id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });

  if (!user) {
    return res.status(404).render("404", { pageTitle: "User Not Found" });
  }

  return res.render("users/profile", {
    pageTitle: `${user.name}`,
    user,
  });
};
