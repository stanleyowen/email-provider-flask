export const getTokenValue = (name: string) => {
  const cookieName =
    process.env.NODE_ENV === "production" ? `__Secure-${name}=` : `${name}=`;
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let data = cookies[i];
    while (data.charAt(0) === " ") data = data.substring(1, data.length);
    if (data.indexOf(cookieName) === 0)
      return data.substring(cookieName.length, data.length);
  }
  return null;
};
