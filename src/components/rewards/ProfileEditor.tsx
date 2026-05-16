import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { User, Target, Activity, MapPin, Search, X, Check, Loader2, ChevronDown } from 'lucide-react';
import { Country, City } from 'country-state-city';
import { db, handleFirestoreError, OperationType } from '../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

interface ProfileEditorProps {
  userId: string;
  profile: any;
  onClose: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ userId, profile, onClose }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [isCountryFocused, setIsCountryFocused] = useState(false);
  const [isCityFocused, setIsCityFocused] = useState(false);
  const [isFitnessOpen, setIsFitnessOpen] = useState(false);
  const [isCalcMethodOpen, setIsCalcMethodOpen] = useState(false);

  const calculationMethods = useMemo(() => [
    { value: 'MWL', label: 'Muslim World League' },
    { value: 'ISNA', label: 'ISNA (North America)' },
    { value: 'Egypt', label: 'Egyptian General Authority of Survey' },
    { value: 'Makkah', label: 'Umm Al-Qura University, Makkah' },
    { value: 'Karachi', label: 'University of Islamic Sciences, Karachi' },
    { value: 'Tehran', label: 'Institute of Geophysics, University of Tehran' },
    { value: 'Jafari', label: 'Shia Ithna-Ashari, Leva Institute, Qum' }
  ], []);

  const [data, setData] = useState({
    name: profile?.name || '',
    age: profile?.age || '',
    height: profile?.height || '',
    currentWeight: profile?.currentWeight || '',
    careerGoal: profile?.careerGoal || '',
    calculationMethod: profile?.calculationMethod || 'MWL',
    country: profile?.country || '',
    countryCode: '', // Helper for city lookup
    city: profile?.city || '',
    location: profile?.location || null,
    fitnessLevel: profile?.fitnessLevel || 'Beginner'
  });

  const countries = useMemo(() => Country.getAllCountries(), []);
  const filteredCountries = useMemo(() => 
    countries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())),
    [countries, countrySearch]
  );

  const cities = useMemo(() => {
    // If we have a countryCode in state, use it. 
    // Otherwise try to find it by country name if editing existing profile
    let code = data.countryCode;
    if (!code && data.country) {
       const c = countries.find(x => x.name === data.country);
       if (c) code = c.isoCode;
    }
    return code ? City.getCitiesOfCountry(code) : [];
  }, [data.countryCode, data.country, countries]);

  const filteredCities = useMemo(() => 
    cities?.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase())) || [],
    [cities, citySearch]
  );

  const save = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', userId), {
        name: data.name,
        age: parseInt(data.age.toString()),
        height: parseInt(data.height.toString()),
        currentWeight: parseFloat(data.currentWeight.toString()),
        careerGoal: data.careerGoal,
        calculationMethod: data.calculationMethod,
        country: data.country,
        city: data.city,
        location: data.location,
        fitnessLevel: data.fitnessLevel
      });
      onClose();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-brand-forest/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-brand-cream rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-8 border-b border-brand-forest/10 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-2xl font-black text-brand-forest italic">{t('profile.editProfile', 'Edit Profile')}</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-forest/40">{t('profile.personalize', 'Personalize your Mizan experience')}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-brand-forest/5 rounded-full transition-colors">
            <X size={24} className="text-brand-forest/40" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Identity Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-2">
              <User size={12} /> {t('profile.identityAge', 'Identity & Age')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4">{t('profile.fullName', 'Full Name')}</label>
                <input 
                  type="text" 
                  value={data.name}
                  onChange={e => setData({...data, name: e.target.value})}
                  className="w-full bg-white p-4 rounded-2xl border-2 border-brand-forest/10 focus:border-brand-forest outline-none transition-all font-bold text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4">{t('profile.age', 'Age')}</label>
                <input 
                  type="number" 
                  value={data.age}
                  onChange={e => setData({...data, age: e.target.value})}
                  className="w-full bg-white p-4 rounded-2xl border-2 border-brand-forest/10 focus:border-brand-forest outline-none transition-all font-bold text-sm"
                />
              </div>
            </div>
          </div>

          {/* Health Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7C2D12] flex items-center gap-2">
              <Activity size={12} /> {t('profile.healthMetrics', 'Health Metrics')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4">{t('profile.height', 'Height')} (cm)</label>
                <input 
                  type="number" 
                  value={data.height}
                  onChange={e => setData({...data, height: e.target.value})}
                  className="w-full bg-white p-4 rounded-2xl border-2 border-brand-forest/10 focus:border-brand-forest outline-none transition-all font-bold text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4">{t('profile.weight', 'Weight')} (kg)</label>
                <input 
                  type="number" 
                  value={data.currentWeight}
                  onChange={e => setData({...data, currentWeight: e.target.value})}
                  className="w-full bg-white p-4 rounded-2xl border-2 border-brand-forest/10 focus:border-brand-forest outline-none transition-all font-bold text-sm"
                />
              </div>
              <div className="space-y-1 relative">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4">{t('profile.fitnessLevel', 'Fitness Level')}</label>
                <button
                  type="button"
                  onClick={() => setIsFitnessOpen(!isFitnessOpen)}
                  className="w-full bg-white p-4 rounded-2xl border-2 border-brand-forest/10 focus:border-brand-forest outline-none transition-all font-bold text-sm flex justify-between items-center"
                >
                  <span>{data.fitnessLevel}</span>
                  <ChevronDown className={`transition-transform duration-200 ${isFitnessOpen ? 'rotate-180' : ''}`} size={16} />
                </button>
                
                {isFitnessOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsFitnessOpen(false)} 
                    />
                    <div className="absolute top-[80px] z-50 w-full bg-white rounded-2xl shadow-xl border border-brand-forest/10 overflow-hidden text-sm">
                      {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => {
                            setData({...data, fitnessLevel: level});
                            setIsFitnessOpen(false);
                          }}
                          className={`w-full p-4 text-left font-bold transition-colors flex items-center justify-between border-b border-brand-forest/5 last:border-0 ${
                            data.fitnessLevel === level 
                              ? 'bg-brand-forest/10 text-brand-forest' 
                              : 'hover:bg-brand-forest/5 text-brand-forest/70'
                          }`}
                        >
                          <span>{level}</span>
                          {data.fitnessLevel === level && <Check size={16} className="text-brand-forest" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Location & Faith Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy flex items-center gap-2">
              <MapPin size={12} /> {t('profile.locationPrayer', 'Location & Prayer Settings')}
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4 block mb-1">{t('profile.country', 'Country')}</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-forest/20" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search Country"
                    value={data.country && !countrySearch ? data.country : countrySearch}
                    onFocus={() => {
                      setIsCountryFocused(true);
                      if (data.country) {
                        setCountrySearch('');
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setIsCountryFocused(false), 200);
                    }}
                    onChange={e => {
                      setCountrySearch(e.target.value);
                      if (data.country) setData({...data, country: '', countryCode: '', city: '', location: null});
                    }}
                    className="w-full bg-white p-4 pl-12 rounded-2xl border-2 border-brand-forest/10 focus:border-brand-forest outline-none transition-all font-bold text-sm"
                  />
                </div>
                {!data.country && isCountryFocused && (countrySearch || filteredCountries.length > 0) && (
                  <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-brand-forest/10 overflow-y-auto max-h-[150px]">
                    {filteredCountries.map(c => (
                      <button 
                        key={c.isoCode}
                        onClick={() => {
                          setData({...data, country: c.name, countryCode: c.isoCode, city: '', location: null});
                          setCountrySearch('');
                        }}
                        className="w-full p-4 text-left hover:bg-brand-forest/5 font-bold transition-colors flex items-center justify-between border-b border-brand-forest/5"
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-xl">{c.flag}</span>
                          <span className="text-sm">{c.name}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {data.country && (
                <div className="relative">
                  <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4 block mb-1">{t('profile.city', 'City')}</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-forest/20" size={18} />
                    <input 
                      type="text" 
                      placeholder={t('profile.searchCity', 'Search City')}
                      value={data.city && !citySearch ? data.city : citySearch}
                      onFocus={() => {
                        setIsCityFocused(true);
                        if (data.city) {
                          setCitySearch('');
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => setIsCityFocused(false), 200);
                      }}
                      onChange={e => {
                        setCitySearch(e.target.value);
                        if (data.city) setData({...data, city: '', location: null});
                      }}
                      className="w-full bg-white p-4 pl-12 rounded-2xl border-2 border-brand-forest/10 focus:border-brand-forest outline-none transition-all font-bold text-sm"
                    />
                  </div>
                  {!data.city && isCityFocused && (citySearch || filteredCities.length > 0) && (
                    <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-brand-forest/10 overflow-y-auto max-h-[150px]">
                      {filteredCities.map((c, i) => (
                        <button 
                          key={`${c.name}-${i}`}
                          onClick={() => {
                            setData({
                              ...data, 
                              city: c.name, 
                              location: { 
                                latitude: parseFloat(c.latitude || '0'), 
                                longitude: parseFloat(c.longitude || '0') 
                              }
                            });
                            setCitySearch('');
                          }}
                          className="w-full p-4 text-left hover:bg-brand-forest/5 font-bold transition-colors border-b border-brand-forest/5"
                        >
                          <span className="text-sm">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1 relative">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4">{t('profile.calculationMethod', 'Calculation Method')}</label>
                <button
                  type="button"
                  onClick={() => setIsCalcMethodOpen(!isCalcMethodOpen)}
                  className="w-full bg-white p-4 rounded-2xl border-2 border-brand-forest/10 focus:border-brand-forest outline-none transition-all font-bold text-sm flex justify-between items-center text-left"
                >
                  <span className="truncate pr-4">{calculationMethods.find(m => m.value === data.calculationMethod)?.label || t('profile.selectMethod', 'Select method')}</span>
                  <ChevronDown className={`transition-transform duration-200 shrink-0 ${isCalcMethodOpen ? 'rotate-180' : ''}`} size={16} />
                </button>
                
                {isCalcMethodOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsCalcMethodOpen(false)} 
                    />
                    <div className="absolute top-[80px] z-50 w-full bg-white rounded-2xl shadow-xl border border-brand-forest/10 overflow-hidden text-sm max-h-[250px] overflow-y-auto">
                      {calculationMethods.map(method => (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => {
                            setData({...data, calculationMethod: method.value});
                            setIsCalcMethodOpen(false);
                          }}
                          className={`w-full p-4 text-left font-bold transition-colors flex items-center justify-between border-b border-brand-forest/5 last:border-0 ${
                            data.calculationMethod === method.value 
                              ? 'bg-brand-forest/10 text-brand-forest' 
                              : 'hover:bg-brand-forest/5 text-brand-forest/70'
                          }`}
                        >
                          <span className="truncate pr-4">{method.label}</span>
                          {data.calculationMethod === method.value && <Check size={16} className="text-brand-forest shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Career Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy flex items-center gap-2">
              <Target size={12} /> {t('profile.careerPillar', 'Career Pillar')}
            </h3>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4">{t('profile.mainCareerGoal', 'Main Career Goal')}</label>
              <input 
                type="text" 
                value={data.careerGoal}
                onChange={e => setData({...data, careerGoal: e.target.value})}
                placeholder={t('profile.careerGoalPlaceholder', 'e.g. Senior Software Architect')}
                className="w-full bg-white p-4 rounded-2xl border-2 border-brand-forest/10 focus:border-brand-forest outline-none transition-all font-bold text-sm"
              />
            </div>
          </div>
        </div>

        <div className="p-8 bg-white border-t border-brand-forest/10">
          <button 
            onClick={save}
            disabled={loading || !data.country || !data.city}
            className="w-full bg-brand-forest text-brand-gold py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-brand-forest/20 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
            {loading ? t('profile.saving', 'Saving Changes...') : t('profile.updateAll', 'Update All Information')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
