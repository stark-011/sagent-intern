let inMemorySession = null;

export const getSession = () => {
  return inMemorySession;
};

export const setSession = (session) => {
  inMemorySession = session || null;
};

export const clearSession = () => {
  inMemorySession = null;
};
