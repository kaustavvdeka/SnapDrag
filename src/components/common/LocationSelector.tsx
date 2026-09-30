import React from 'react';
import BrutalModal from './BrutalModal.js';
import BrutalButton from './BrutalButton.js';
import { useLocation } from '../../context/LocationContext.js';
import { MapPin, Navigation, Building2, Check } from 'lucide-react';

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ isOpen, onClose }) => {
  const { selectedCity, setSelectedCity, availableCities, requestCurrentLocation, isDetectingLocation } =
    useLocation();

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    onClose();
  };

  return (
    <BrutalModal isOpen={isOpen} onClose={onClose} title="SELECT SHOPPING LOCATION" maxWidth="md">
      <div className="space-y-4">
        <p className="text-sm font-medium text-neutral-700">
          Find traditional clothing shops, verified stock, and mall floor numbers in your city.
        </p>

        {/* GPS Auto-detect button */}
        <div className="p-3 bg-[#FFE600] border-2 border-[#121212] shadow-brutal-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="text-[#121212] animate-pulse" size={20} strokeWidth={2.5} />
            <div>
              <p className="text-xs font-black uppercase">Current Location</p>
              <p className="text-xs text-neutral-800">Detect nearest shops via GPS</p>
            </div>
          </div>
          <BrutalButton
            size="sm"
            variant="dark"
            onClick={async () => {
              await requestCurrentLocation();
              onClose();
            }}
            isLoading={isDetectingLocation}
          >
            Auto-Detect
          </BrutalButton>
        </div>

        {/* City Grid */}
        <div className="pt-2">
          <h4 className="text-xs font-black uppercase tracking-wider mb-2 text-neutral-500">
            Available Cities & Artisan Hubs
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {availableCities.map((item) => {
              const isSelected = selectedCity.toLowerCase() === item.city.toLowerCase();
              return (
                <button
                  key={item.city}
                  onClick={() => handleSelectCity(item.city)}
                  className={`p-3 text-left border-2 border-[#121212] transition-all flex items-start justify-between ${
                    isSelected
                      ? 'bg-[#00E599] shadow-brutal translate-x-0.5 translate-y-0.5 font-bold'
                      : 'bg-white shadow-brutal-sm hover:bg-[#FFFDF5] hover:translate-x-0.5 hover:translate-y-0.5'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-black text-sm text-[#121212]">
                      <MapPin size={16} />
                      {item.city}
                    </div>
                    <span className="text-xs text-neutral-600 block mt-0.5 font-mono">
                      {item.state} • {item.shopCount} {item.shopCount === 1 ? 'shop' : 'shops'}
                    </span>
                  </div>
                  {isSelected && <Check size={18} className="text-[#121212] mt-0.5" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t-2 border-[#121212] flex items-center justify-between text-xs text-neutral-600">
          <span className="flex items-center gap-1">
            <Building2 size={14} /> Malls & Street Markets supported
          </span>
          <span className="font-bold">Always changeable</span>
        </div>
      </div>
    </BrutalModal>
  );
};

export default LocationSelector;
