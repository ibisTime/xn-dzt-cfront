import storage from 'good-storage';

const AVATAR_KEY = '__avatar__';
const AVATAR_MAX_LEN = 9;

function insertArray(arr, val, compare, maxLen) {
  const index = arr.findIndex(compare);
  if (index > -1) {
    return;
  }
  arr.push(val);
  if (maxLen && arr.length > maxLen) {
    arr.shift();
  }
}

function deleteFromArray(arr, compare) {
  const index = arr.findIndex(compare);
  if (index > -1) {
    arr.splice(index, 1);
  }
}

function editFromArray(arr, val, compare) {
  const index = arr.findIndex(compare);
  console.log(index);
  if (index === -1) {
    return;
  }
  arr.splice(index, 1, val);
}

export function saveAvatar(avatar) {
  let avatars = storage.get(AVATAR_KEY, []);
  insertArray(avatars, avatar, (item) => {
    return item.key === avatar.key;
  }, AVATAR_MAX_LEN);
  storage.set(AVATAR_KEY, avatars);
  return avatars;
}

export function deleteAvatar(avatar) {
  let avatars = storage.get(AVATAR_KEY, []);
  deleteFromArray(avatars, (item) => {
    return item.key === avatar.key;
  });
  storage.set(AVATAR_KEY, avatars);
  return avatars;
}

export function editAvatar (avatar) {
  let avatars = storage.get(AVATAR_KEY, []);
  editFromArray(avatars, avatar, (item) => {
    return item.key === avatar.oriKey;
  });
  storage.set(AVATAR_KEY, avatars);
  return avatars;
}

export function clearAvatar() {
  storage.remove(AVATAR_KEY);
  return [];
}

export function loadAvatar() {
  return storage.get(AVATAR_KEY, []);
}
