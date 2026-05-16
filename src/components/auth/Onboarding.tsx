import React, { useState, useMemo, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../../services/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '../../FirebaseContext';
import { motion, AnimatePresence } from 'motion/react';
import { User, Target, Activity, MapPin, Search, ChevronDown, Check, Globe } from 'lucide-react';
import { Country, City } from 'country-state-city';
import { useTranslation } from 'react-i18next';

export const Onboarding: React.FC = () => {
  const { user, profile } = useFirebase();
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [isCountryFocused, setIsCountryFocused] = useState(false);
  const [isCityFocused, setIsCityFocused] = useState(false);
  const [isFitnessOpen, setIsFitnessOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [data, setData] = useState({
    language: i18n.language || 'en',
    name: '', // Strictly empty for new accounts as requested
    age: profile?.age || '',
    height: profile?.height || '',
    currentWeight: profile?.currentWeight || '',
    careerGoal: profile?.careerGoal || '',
    calculationMethod: profile?.calculationMethod || 'ISNA',
    country: profile?.country || '',
    countryCode: '',
    city: profile?.city || '',
    location: profile?.location || null,
    fitnessLevel: profile?.fitnessLevel || 'Beginner'
  });

  const countries = useMemo(() => Country.getAllCountries(), []);
  const filteredCountries = useMemo(() => 
    countries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())),
    [countries, countrySearch]
  );

  const cities = useMemo(() => 
    data.countryCode ? City.getCitiesOfCountry(data.countryCode) : [],
    [data.countryCode]
  );

  const filteredCities = useMemo(() => 
    cities?.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase())) || [],
    [cities, citySearch]
  );

  const handleNext = () => {
    setError(null);
    let valid = true;

    if (step === 1) {
      if (!data.language) valid = false;
    } else if (step === 2) {
      if (!data.name || !data.age) valid = false;
    } else if (step === 3) {
      if (!data.height || !data.currentWeight) valid = false;
    } else if (step === 4) {
      if (!data.careerGoal || !data.country || !data.city) valid = false;
    }

    if (!valid) {
      setError(t('onboarding.validationError', 'Please fill out all required fields to continue.'));
      return;
    }

    if (step === steps.length) {
      finish();
    } else {
      setStep(step + 1);
    }
  };

  const finish = async () => {
    if (!user) return;
    
    const ageNum = parseInt(data.age as string);
    const heightNum = parseInt(data.height as string);
    const weightNum = parseFloat(data.currentWeight as string);

    if (isNaN(ageNum) || isNaN(heightNum) || isNaN(weightNum)) {
      setError(t('onboarding.validationErrorNumbers', 'Please enter valid numbers for age, height, and weight.'));
      return;
    }

    setLoading(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        language: data.language,
        name: data.name,
        email: user.email,
        age: ageNum,
        height: heightNum,
        currentWeight: weightNum,
        careerGoal: data.careerGoal,
        country: data.country,
        city: data.city,
        location: data.location,
        fitnessLevel: data.fitnessLevel,
        onboardingComplete: true,
        points: 50, // Initial bonus
        level: 1,
        streak: 1, // Start streak!
        streakFreezes: 0,
        lastLoginDate: new Date().toLocaleDateString('en-CA'),
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' }
  ];

  const filteredLanguages = useMemo(() => 
    languages.filter(l => 
      l.name.toLowerCase().includes(languageSearch.toLowerCase()) || 
      l.native.toLowerCase().includes(languageSearch.toLowerCase())
    ),
    [languageSearch]
  );

  const steps = [
    {
      title: t('onboarding.language.title', 'Select Language'),
      desc: t('onboarding.language.desc', 'Choose your preferred language for the Mizan experience.'),
      icon: <Globe className="text-brand-forest" />,
      fields: (
        <div className="space-y-4">
          <div className="relative z-50">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-forest/60 ml-2 block mb-2">Language</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-forest/40 group-focus-within:text-brand-forest transition-colors" size={18} />
              <input 
                type="text" 
                placeholder={
                  data.language && !isLanguageOpen
                    ? languages.find(l => l.code === data.language)?.name 
                    : t('common.search', 'Search language...')
                }
                value={isLanguageOpen ? languageSearch : (languages.find(l => l.code === data.language)?.name || '')}
                onFocus={() => {
                  setIsLanguageOpen(true);
                  setLanguageSearch('');
                }}
                onChange={e => {
                  setLanguageSearch(e.target.value);
                }}
                className="w-full bg-white p-4 pl-12 rounded-xl border border-brand-forest/20 focus:border-brand-forest focus:ring-4 focus:ring-brand-forest/10 outline-none transition-all placeholder:text-brand-forest/30"
              />
            </div>
            
            {isLanguageOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setIsLanguageOpen(false)} />
                <div className="absolute w-full mt-2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-brand-forest/10 overflow-hidden text-sm z-50">
                  {filteredLanguages.map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setData({...data, language: lang.code});
                        i18n.changeLanguage(lang.code);
                        setLanguageSearch('');
                        setIsLanguageOpen(false);
                      }}
                      className={`w-full p-4 text-left font-medium transition-colors flex items-center justify-between border-b border-brand-forest/5 last:border-0 ${
                        data.language === lang.code 
                          ? 'bg-brand-forest/10 text-brand-forest' 
                          : 'hover:bg-brand-forest/5 text-brand-forest/70'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{lang.native}</span>
                        <span className="text-xs opacity-60">{lang.name}</span>
                      </div>
                      {data.language === lang.code && <Check size={16} className="text-brand-forest" />}
                    </button>
                  ))}
                  {filteredLanguages.length === 0 && (
                    <div className="p-4 text-brand-forest/50 text-sm text-center">No languages found</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )
    },
    {
      title: t('onboarding.identity.title', 'Welcome to Mizan'),
      desc: t('onboarding.identity.desc', "Let's personalize your balance journey. What should we call you?"),
      icon: <User className="text-brand-forest" />,
      fields: (
          <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-forest/60 ml-2">{t('onboarding.identity.fullName', 'Full Name')}</label>
            <input 
              type="text" 
              placeholder={t('onboarding.identity.fullNamePlaceholder', 'Your Full Name')}
              value={data.name}
              onChange={e => setData({...data, name: e.target.value})}
              className="w-full bg-white p-4 rounded-xl border border-brand-forest/20 focus:border-brand-forest focus:ring-4 focus:ring-brand-forest/10 outline-none transition-all placeholder:text-brand-forest/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-forest/60 ml-2">{t('onboarding.identity.age', 'Age')}</label>
            <input 
              type="number" 
              placeholder={t('onboarding.identity.agePlaceholder', 'Age')}
              value={data.age}
              onChange={e => setData({...data, age: e.target.value})}
              className="w-full bg-white p-4 rounded-xl border border-brand-forest/20 focus:border-brand-forest focus:ring-4 focus:ring-brand-forest/10 outline-none transition-all placeholder:text-brand-forest/30"
            />
          </div>
        </div>
      )
    },
    {
      title: t('onboarding.health.title', 'Health Baseline'),
      desc: t('onboarding.health.desc', 'To track your physical pillar accurately. Height and weight are required for BMI.'),
      icon: <Activity className="text-pillar-health" />,
      fields: (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-pillar-health/60 ml-2">{t('onboarding.health.height', 'Height (cm)')}</label>
            <input 
              type="number" 
              placeholder={t('onboarding.health.heightPlaceholder', 'Height (e.g. 175)')}
              value={data.height}
              onChange={e => setData({...data, height: e.target.value})}
              className="w-full bg-white p-4 rounded-xl border border-pillar-health/20 focus:border-pillar-health focus:ring-4 focus:ring-pillar-health/10 outline-none transition-all placeholder:text-pillar-health/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-pillar-health/60 ml-2">{t('onboarding.health.weight', 'Current Weight (kg)')}</label>
            <input 
              type="number" 
              placeholder={t('onboarding.health.weightPlaceholder', 'Weight (kg)')}
              value={data.currentWeight}
              onChange={e => setData({...data, currentWeight: e.target.value})}
              className="w-full bg-white p-4 rounded-xl border border-pillar-health/20 focus:border-pillar-health focus:ring-4 focus:ring-pillar-health/10 outline-none transition-all placeholder:text-pillar-health/30"
            />
          </div>
        </div>
      )
    },
    {
      title: t('onboarding.career.title', 'Career & Faith'),
      desc: t('onboarding.career.desc', 'Accurate location ensures perfect prayer timings.'),
      icon: <Target className="text-pillar-career" />,
      fields: (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-pillar-career/70 ml-2">{t('onboarding.career.careerGoal', 'Main Career Goal')}</label>
            <input 
              type="text" 
              placeholder={t('onboarding.career.careerGoalPlaceholder', 'e.g. Software Engineer')}
              value={data.careerGoal}
              onChange={e => setData({...data, careerGoal: e.target.value})}
              className="w-full bg-white p-4 rounded-xl border border-pillar-career/20 focus:border-pillar-career focus:ring-4 focus:ring-pillar-career/10 outline-none transition-all placeholder:text-pillar-career/30"
            />
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <label className="text-[10px] font-bold uppercase tracking-widest text-pillar-career/70 ml-2 block mb-2">{t('onboarding.career.country', 'Select Country')}</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pillar-career/40 group-focus-within:text-pillar-career transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder={t('onboarding.career.searchCountry', 'Search Country')}
                  value={data.country && !countrySearch ? data.country : countrySearch}
                  onFocus={() => {
                    setIsCountryFocused(true);
                    if (data.country) {
                      setCountrySearch('');
                    }
                  }}
                  onBlur={() => {
                    // Small delay to allow click on dropdown to register
                    setTimeout(() => setIsCountryFocused(false), 200);
                  }}
                  onChange={e => {
                    setCountrySearch(e.target.value);
                    if (data.country) setData({...data, country: '', countryCode: '', city: '', location: null});
                  }}
                  className="w-full bg-white p-4 pl-12 rounded-xl border border-pillar-career/20 focus:border-pillar-career focus:ring-4 focus:ring-pillar-career/10 outline-none transition-all placeholder:text-pillar-career/30"
                />
              </div>
              {!data.country && isCountryFocused && (countrySearch || filteredCountries.length > 0) && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-pillar-career/10 overflow-y-auto max-h-[200px]">
                  {filteredCountries.map(c => (
                    <button 
                      key={c.isoCode}
                      onClick={() => {
                        setData({...data, country: c.name, countryCode: c.isoCode, city: '', location: null});
                        setCountrySearch('');
                      }}
                      className="w-full p-4 text-left hover:bg-pillar-career/5 focus:bg-pillar-career/5 outline-none font-medium transition-colors flex items-center gap-3 border-b border-pillar-career/5 last:border-0"
                    >
                      <span className="text-xl">{c.flag}</span>
                      <span className="text-pillar-career text-sm">{c.name}</span>
                    </button>
                  ))}
                  {filteredCountries.length === 0 && <div className="p-4 text-pillar-career/50 text-sm text-center">No countries found</div>}
                </div>
              )}
            </div>

            {data.country && (
              <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-bold uppercase tracking-widest text-pillar-career/70 ml-2 block mb-2">{t('onboarding.career.city', 'Select City in {{country}}', { country: data.country })}</label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pillar-career/40 group-focus-within:text-pillar-career transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder={t('onboarding.career.searchCity', 'Search City')}
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
                    className="w-full bg-white p-4 pl-12 rounded-xl border border-pillar-career/20 focus:border-pillar-career focus:ring-4 focus:ring-pillar-career/10 outline-none transition-all placeholder:text-pillar-career/30"
                  />
                </div>
                {!data.city && isCityFocused && (citySearch || filteredCities.length > 0) && (
                  <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-pillar-career/10 overflow-y-auto max-h-[200px]">
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
                        className="w-full p-4 text-left hover:bg-pillar-career/5 focus:bg-pillar-career/5 outline-none font-medium transition-colors border-b border-pillar-career/5 last:border-0"
                      >
                        <span className="text-pillar-career text-sm">{c.name}</span>
                      </button>
                    ))}
                    {filteredCities.length === 0 && <div className="p-4 text-pillar-career/50 text-sm text-center">No cities found</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }
  ];

  const current = steps[step - 1];

  return (
    <div className="fixed inset-0 bg-[#F4F1EB] z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white rounded-[40px] p-10 shadow-2xl space-y-8"
      >
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-brand-forest/5 flex items-center justify-center">
            {current.icon}
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-brand-forest italic">{current.title}</h2>
          <p className="text-brand-forest/40 font-medium px-4">{current.desc}</p>
        </div>

        <div className="py-2">
          {current.fields}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3">
          {step > 1 && (
            <button 
              onClick={() => { setError(null); setStep(step - 1); }}
              className="flex-1 py-4 rounded-2xl border-2 border-brand-forest/10 font-black text-brand-forest text-xs uppercase tracking-widest"
            >
              Back
            </button>
          )}
          <button 
            onClick={handleNext}
            disabled={loading}
            className="flex-[2] py-4 rounded-2xl bg-brand-forest text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-forest/20 flex items-center justify-center gap-2 transition-all hover:bg-brand-forest/90 active:scale-[0.98]"
          >
            {loading ? t('common.loading', "Initializing...") : (step === steps.length ? t('onboarding.start', "Begin My Journey") : t('onboarding.next', "Next Step"))}
          </button>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 pt-4">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all ${i + 1 === step ? 'w-8 bg-brand-forest' : 'w-2 bg-brand-forest/10'}`} 
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};
