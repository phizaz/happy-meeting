import {FIREBASE} from 'redux/constant';
import Firebase from 'firebase';

export const fireRef = new Firebase(FIREBASE);

export function doesExist (ref) {
  return new Promise((resolve, reject) => {
    ref.once('value', (snapshot) => {
      const val = snapshot.val();
      if (val) {
        resolve(val);
      } else {
        reject('does not exist');
      }
    });
  });
}

export function fetch (ref) {
  return new Promise((resolve, reject) => {
    ref.once('value', (snapshot) => {
      const val = snapshot.val();
      resolve(val);
    });
  });
}

export function fetchOrFail (ref) {
  return doesExist(ref);
}

export function fetchUser (uid) {
  const userRef = fireRef.child('users').child(uid);
  return new Promise((resolve, reject) => {
    fetchOrFail(userRef)
      .then((user) => resolve({...user, uid: uid}))
      .catch((err) => reject(err));
  });
}
