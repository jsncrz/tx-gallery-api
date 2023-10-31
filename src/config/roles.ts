const allRoles = {
  user: ['favoriteCharacter'],
  admin: ['getUsers', 'manageUsers', 'modifyTweet', 'updateCharacter'],
};

export const roles: string[] = Object.keys(allRoles);
export const roleRights: Map<string, string[]> = new Map(Object.entries(allRoles));
