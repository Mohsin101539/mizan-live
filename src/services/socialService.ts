import { collection, doc, setDoc, getDocs, query, where, serverTimestamp, getDoc, updateDoc, arrayUnion, deleteDoc, arrayRemove } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Group, GroupMember, UserProfile } from '../types';

export const createGroup = async (name: string, user: { uid: string }, profile: UserProfile): Promise<string> => {
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const groupId = doc(collection(db, 'groups')).id;

  const newGroup: any = {
    id: groupId,
    name,
    inviteCode,
    adminUid: user.uid,
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'groups', groupId), newGroup);

    // Add creator as member
    await setDoc(doc(db, 'groups', groupId, 'members', user.uid), {
      uid: user.uid,
      name: profile.name,
      points: profile.points,
      streak: profile.streak,
      joinedAt: serverTimestamp(),
    });

    return inviteCode;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `groups`);
    throw error;
  }
};

export const joinGroup = async (inviteCode: string, user: { uid: string }, profile: UserProfile): Promise<string> => {
  try {
    const q = query(collection(db, 'groups'), where('inviteCode', '==', inviteCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('Invalid invite code');
    }

    const groupDoc = querySnapshot.docs[0];
    const groupId = groupDoc.id;

    await setDoc(doc(db, 'groups', groupId, 'members', user.uid), {
      uid: user.uid,
      name: profile.name,
      points: profile.points,
      streak: profile.streak,
      joinedAt: serverTimestamp(),
    });

    return groupId;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `groups`);
    throw error;
  }
};

export const getUserGroups = async (uid: string): Promise<Group[]> => {
  try {
    // A bit hacky without a subcollection mapping, but since we can't do collectionGroup efficiently here without an index
    // Another way is to keep a list of groupIds on the user profile
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return [];
    
    const userGroups = userDoc.data()?.groups || [];
    
    const groups: Group[] = [];
    for (const groupId of userGroups) {
      const gDoc = await getDoc(doc(db, 'groups', groupId));
      if (gDoc.exists()) {
        groups.push({ id: gDoc.id, ...gDoc.data() } as Group);
      }
    }
    return groups;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    return [];
  }
};

export const joinGroupAndUpdateUser = async (inviteCode: string, user: { uid: string }, profile: UserProfile): Promise<string> => {
  const groupId = await joinGroup(inviteCode, user, profile);
  try {
      await updateDoc(doc(db, 'users', user.uid), {
          groups: arrayUnion(groupId)
      });
  } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
  }
  return groupId;
};

export const createGroupAndUpdateUser = async (name: string, user: { uid: string }, profile: UserProfile): Promise<string> => {
    const inviteCode = await createGroup(name, user, profile);
    try {
        const q = query(collection(db, 'groups'), where('inviteCode', '==', inviteCode));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const groupId = querySnapshot.docs[0].id;
            await updateDoc(doc(db, 'users', user.uid), {
                groups: arrayUnion(groupId)
            });
        }
    } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
    }
    return inviteCode;
};

export const leaveGroupAndUpdateUser = async (groupId: string, user: { uid: string }): Promise<void> => {
    try {
        // Remove from members subcollection
        await deleteDoc(doc(db, 'groups', groupId, 'members', user.uid));
        // Remove from user's groups array
        await updateDoc(doc(db, 'users', user.uid), {
            groups: arrayRemove(groupId)
        });
    } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `groups/${groupId}/members/${user.uid}`);
        throw e;
    }
};

export const renameGroup = async (groupId: string, newName: string): Promise<void> => {
    try {
        await updateDoc(doc(db, 'groups', groupId), {
            name: newName
        });
    } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `groups/${groupId}`);
        throw e;
    }
};
