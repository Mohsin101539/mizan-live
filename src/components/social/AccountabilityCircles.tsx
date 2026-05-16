import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, Hash, Copy, CheckCircle, Shield, Loader2, Trophy, LogOut, Edit2, Check, X } from 'lucide-react';
import { useFirebase } from '../../FirebaseContext';
import { createGroupAndUpdateUser, joinGroupAndUpdateUser, getUserGroups, leaveGroupAndUpdateUser, renameGroup } from '../../services/socialService';
import { Group, GroupMember } from '../../types';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../services/firebase';

export const AccountabilityCircles: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile } = useFirebase();
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingNameValue, setEditingNameValue] = useState('');

  useEffect(() => {
    if (!user) return;
    
    const fetchGroups = async () => {
      setLoading(true);
      const userGroups = await getUserGroups(user.uid);
      setGroups(userGroups);
      if (userGroups.length > 0) {
        setActiveGroup(userGroups[0]);
      }
      setLoading(false);
    };
    
    fetchGroups();
  }, [user]);

  useEffect(() => {
    if (activeGroup) {
      setEditingNameValue(activeGroup.name);
      setIsEditingName(false);
    }
  }, [activeGroup]);

  useEffect(() => {
    if (!activeGroup || !user) return;
    
    const pathForOnSnapshot = `groups/${activeGroup.id}/members`;
    const unsubscribe = onSnapshot(collection(db, 'groups', activeGroup.id, 'members'), (snapshot) => {
      const fetchedMembers = snapshot.docs.map(doc => doc.data() as GroupMember);
      // Sort by points descending
      fetchedMembers.sort((a, b) => b.points - a.points);
      setMembers(fetchedMembers);
    }, (error: any) => {
      // Ignore permission denied errors that occur cleanly when leaving a group (listener is still active briefly)
      if (
        error?.code === 'permission-denied' || 
        (error?.message && error.message.includes('Missing or insufficient permissions'))
      ) {
          console.log("Expected permission error on group leave. Ignored.");
          return;
      }
      handleFirestoreError(error, OperationType.GET, pathForOnSnapshot);
    });

    return () => unsubscribe();
  }, [activeGroup, user]);

  const handleCreateGroup = async () => {
    if (!user || !profile || !newGroupName.trim()) return;
    
    setError(null);
    setIsCreating(true);
    try {
      await createGroupAndUpdateUser(newGroupName, user, profile);
      const userGroups = await getUserGroups(user.uid);
      setGroups(userGroups);
      setActiveGroup(userGroups[userGroups.length - 1]);
      setNewGroupName('');
      setIsCreating(false);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to create group.");
      setIsCreating(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!user || !profile || !inviteCodeInput.trim()) return;
    
    setError(null);
    setIsJoining(true);
    try {
      await joinGroupAndUpdateUser(inviteCodeInput.toUpperCase(), user, profile);
      const userGroups = await getUserGroups(user.uid);
      setGroups(userGroups);
      setActiveGroup(userGroups[userGroups.length - 1]);
      setInviteCodeInput('');
      setIsJoining(false);
    } catch (e: any) {
      console.error(e);
      setError("Invalid invite code or already joined.");
      setIsJoining(false);
    }
  };

  const [isConfirmingLeave, setIsConfirmingLeave] = useState(false);

  const handleLeaveGroup = async () => {
      if (!user || !activeGroup) return;
      setIsConfirmingLeave(true);
  };

  const confirmLeaveGroup = async () => {
      if (!user || !activeGroup) return;
      const prevActiveGroup = activeGroup;
      setActiveGroup(null);
      try {
          await leaveGroupAndUpdateUser(prevActiveGroup.id, user);
          const userGroups = await getUserGroups(user.uid);
          setGroups(userGroups);
          setActiveGroup(userGroups.length > 0 ? userGroups[0] : null);
          setIsConfirmingLeave(false);
      } catch (e) {
          setActiveGroup(prevActiveGroup);
          console.error(e);
          setError("Failed to leave group.");
          setIsConfirmingLeave(false);
      }
  };

  const handleRenameGroup = async () => {
      if (!activeGroup || !editingNameValue.trim()) return;
      try {
          await renameGroup(activeGroup.id, editingNameValue);
          setActiveGroup({ ...activeGroup, name: editingNameValue });
          // Also update in list
          setGroups(groups.map(g => g.id === activeGroup.id ? { ...g, name: editingNameValue } : g));
          setIsEditingName(false);
      } catch (e) {
          console.error(e);
          setError("Failed to rename group.");
      }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user || !profile) return null;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-brand-forest/10">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="text-brand-forest" size={24} />
            Accountability Circles
          </h2>
          <p className="text-sm font-medium opacity-60 mt-1">Shared commitment. Shared growth.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin opacity-50" />
        </div>
      ) : (
        <>
          {groups.length === 0 ? (
            <div className="bg-brand-forest/5 p-6 rounded-2xl border border-brand-forest/10 flex flex-col items-center justify-center text-center space-y-4">
              <div className="bg-white p-3 rounded-xl shadow-sm text-brand-forest/50">
                <Shield size={32} />
              </div>
              <p className="font-medium text-brand-forest/80">You are not in any circles yet.</p>
              
              <div className="w-full space-y-4 mt-4">
                <div className="space-y-2">
                  <input 
                    type="text" 
                    placeholder="Enter Invite Code"
                    value={inviteCodeInput}
                    onChange={e => setInviteCodeInput(e.target.value.toUpperCase())}
                    className="w-full p-4 rounded-xl border-2 border-brand-forest/10 outline-none focus:border-brand-forest font-bold tracking-widest text-center uppercase shadow-inner"
                    maxLength={6}
                  />
                  <button 
                    onClick={handleJoinGroup}
                    disabled={isJoining || inviteCodeInput.length < 6}
                    className="w-full bg-brand-forest text-brand-cream p-4 rounded-xl font-bold hover:bg-brand-forest/90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {isJoining ? <Loader2 className="animate-spin" size={20} /> : <Hash size={20} />} 
                    Join Circle
                  </button>
                </div>
                
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-b border-brand-forest/10"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-brand-cream px-4 text-xs font-bold text-brand-forest/40 uppercase tracking-widest">OR</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <input 
                    type="text" 
                    placeholder="New Circle Name"
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    className="w-full p-4 rounded-xl border-2 border-brand-forest/10 outline-none focus:border-brand-forest font-bold"
                  />
                  <button 
                    onClick={handleCreateGroup}
                    disabled={isCreating || newGroupName.trim().length === 0}
                    className="w-full bg-white border border-brand-forest/20 text-brand-forest p-4 rounded-xl font-bold hover:bg-brand-forest/5 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm"
                  >
                    {isCreating ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />} 
                    Create Circle
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Group Selector */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
                {groups.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setActiveGroup(g)}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl font-bold snap-start transition-colors ${
                      activeGroup?.id === g.id 
                        ? 'bg-brand-forest text-brand-cream shadow-md' 
                        : 'bg-white border border-brand-forest/10 text-brand-forest hover:bg-brand-forest/5'
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>

              {activeGroup && (
                <div className="bg-white border border-brand-forest/10 rounded-3xl p-6 shadow-sm">
                  {/* Active Group Header */}
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex-1 mr-4">
                      {isEditingName && activeGroup.adminUid === user.uid ? (
                          <div className="flex items-center gap-2 mb-1">
                              <input 
                                  value={editingNameValue} 
                                  onChange={e => setEditingNameValue(e.target.value)}
                                  className="text-2xl font-black text-brand-forest px-2 py-1 border-b-2 border-brand-forest focus:outline-none w-full max-w-[200px]"
                                  autoFocus
                              />
                              <button onClick={handleRenameGroup} className="p-2 bg-brand-forest text-white rounded-xl"><Check size={16}/></button>
                              <button onClick={() => setIsEditingName(false)} className="p-2 bg-gray-200 text-gray-700 rounded-xl"><X size={16}/></button>
                          </div>
                      ) : (
                          <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-2xl font-black text-brand-forest">{activeGroup.name}</h3>
                              {activeGroup.adminUid === user.uid && (
                                  <button onClick={() => setIsEditingName(true)} className="p-1 hover:bg-brand-forest/10 rounded-lg text-brand-forest/50 transition-colors">
                                      <Edit2 size={16} />
                                  </button>
                              )}
                          </div>
                      )}
                      <p className="text-sm font-bold text-brand-forest/40 flex items-center gap-1">
                        <Users size={14} /> {members.length} Members
                        {activeGroup.adminUid === user.uid && <span className="ml-2 px-2 py-0.5 bg-brand-forest/10 text-[10px] uppercase rounded-full tracking-widest text-brand-forest/60">Admin</span>}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => handleCopyCode(activeGroup.inviteCode)}
                      className="bg-brand-forest/5 hover:bg-brand-forest/10 transition-colors p-3 rounded-2xl flex flex-col items-center justify-center gap-1 min-w-[80px] shrink-0"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-forest/40">Invite Code</span>
                      {copied ? (
                        <span className="text-brand-forest font-black tracking-widest flex items-center gap-1"><CheckCircle size={16}/> Copied</span>
                      ) : (
                        <span className="text-brand-forest font-black tracking-widest flex items-center gap-1">{activeGroup.inviteCode} <Copy size={14}/></span>
                      )}
                    </button>
                  </div>

                  <div className="flex justify-end mb-4">
                    {isConfirmingLeave ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-brand-forest/60">Are you sure?</span>
                        <button 
                            onClick={confirmLeaveGroup}
                            className="text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors border border-red-100"
                        >
                            Yes, Leave
                        </button>
                        <button 
                            onClick={() => setIsConfirmingLeave(false)}
                            className="text-xs font-bold bg-gray-50 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors border border-gray-100"
                        >
                            Cancel
                        </button>
                      </div>
                    ) : (
                      <button 
                          onClick={handleLeaveGroup}
                          className="text-xs font-bold text-red-500 flex items-center gap-1 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
                      >
                          <LogOut size={14} /> Leave Circle
                      </button>
                    )}
                  </div>

                  {/* Leaderboard */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-forest/40 mb-4">Mizan Scoreboard</h4>
                    {members.map((m, index) => (
                      <div 
                        key={m.uid} 
                        className={`flex items-center p-4 rounded-2xl border ${m.uid === user.uid ? 'bg-brand-forest/5 border-brand-forest/20' : 'bg-white border-brand-forest/5'}`}
                      >
                        <div className="w-8 flex justify-center text-xl font-black text-brand-forest/30">
                          {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="font-bold text-brand-forest">{m.name} {m.uid === user.uid && <span className="text-xs opacity-50 ml-1">(You)</span>}</p>
                          <div className="flex gap-3 text-xs font-bold text-brand-forest/50 mt-1">
                            <span className="flex items-center gap-1"><Trophy size={10} /> {m.points} pts</span>
                            <span>🔥 {m.streak} day streak</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
