import { UserMap, UserState } from "./types";

export function initUserState(): UserState {
  return {
    isBumping: false,
    stopBumping: true,
    createdAt: new Date().toISOString(),
  };
}

// Clean user state every 15 minutes
export function cleanUserStateInterval(userMap: UserMap) {
  const expirationTime = 15 * 60 * 1000; // 15 minutes in milliseconds
  setInterval(() => {
    console.log(userMap);
    const now = Date.now();

    userMap.forEach((userState, userId) => {
      const createdAtTimestamp = new Date(userState.createdAt).getTime(); // Convert ISO string to timestamp
      if (!userState.isBumping && now - createdAtTimestamp > expirationTime) {
        userMap.delete(userId); // Remove inactive user states
      }
    });

    console.log(userMap);
  }, expirationTime); // Run every 15 minutes
}
