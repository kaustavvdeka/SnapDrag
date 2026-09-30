import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client.js';
import { CityLocation } from '../types/index.js';

interface LocationContextType {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  availableCities: CityLocation[];
  userCoordinates: { lat: number; lng: number } | null;
  requestCurrentLocation: () => Promise<void>;
  isDetectingLocation: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const DEFAULT_CITY = 'Guwahati';

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCityState] = useState<string>(() => {
    return localStorage.getItem('snapdrag_selected_city') || DEFAULT_CITY;
  });

  const [availableCities, setAvailableCities] = useState<CityLocation[]>([
    { city: 'Guwahati', state: 'Assam', shopCount: 3 },
    { city: 'Silchar', state: 'Assam', shopCount: 2 },
    { city: 'Kolkata', state: 'West Bengal', shopCount: 1 },
    { city: 'Delhi', state: 'Delhi', shopCount: 1 },
    { city: 'Jaipur', state: 'Rajasthan', shopCount: 1 },
    { city: 'Varanasi', state: 'Uttar Pradesh', shopCount: 1 },
    { city: 'Mumbai', state: 'Maharashtra', shopCount: 1 },
    { city: 'Chennai', state: 'Tamil Nadu', shopCount: 1 },
  ]);

  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  useEffect(() => {
    // Fetch live cities from backend
    api.get('/locations/cities')
      .then((res: any) => {
        if (res.data && res.data.length > 0) {
          setAvailableCities(res.data);
        }
      })
      .catch((e) => console.log('Using default cities fallback'));
  }, []);

  const setSelectedCity = (city: string) => {
    setSelectedCityState(city);
    localStorage.setItem('snapdrag_selected_city', city);
  };

  const requestCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoordinates({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsDetectingLocation(false);
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err.message);
        setIsDetectingLocation(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <LocationContext.Provider
      value={{
        selectedCity,
        setSelectedCity,
        availableCities,
        userCoordinates,
        requestCurrentLocation,
        isDetectingLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
