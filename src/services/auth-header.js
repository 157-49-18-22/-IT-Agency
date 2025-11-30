export default function authHeader() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.accessToken) {
    // Return the JWT token for the API request in the format: Bearer <token>
    return 'Bearer ' + user.accessToken;
  }
  return null;
}
