export async function checkAuth() {
  try {
<<<<<<< HEAD
    const response = await fetch('/api/auth/login', {
      credentials: 'include',
    });
    
=======
    const response = await fetch('/api/auth/login', { credentials: 'include' });
>>>>>>> main

    if (response.ok) {
      const data = await response.json();
      return { isAuthenticated: true, user: data };
    }

    return { isAuthenticated: false, user: null };
  } catch {
    return { isAuthenticated: false, user: null };
  }
}

export async function logout() {
  try {
    await fetch('/api/auth/login', {
<<<<<<< HEAD
      method: 'DELETE',
      credentials: 'include',
=======
      method: 'DELETE'
      , credentials: 'include'
>>>>>>> main
    });
    
    return true;
  } catch {
    return false;
  }
}
