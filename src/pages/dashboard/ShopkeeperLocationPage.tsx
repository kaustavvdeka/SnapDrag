import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout.js';
import BrutalCard from '../../components/common/BrutalCard.js';
import BrutalInput from '../../components/common/BrutalInput.js';
import BrutalButton from '../../components/common/BrutalButton.js';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import { Building2, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

export const ShopkeeperLocationPage: React.FC = () => {
  const { user } = useAuth();
  const shop = user?.shops && user.shops.length > 0 ? user.shops[0] : null;

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Guwahati');
  const [state, setState] = useState('Assam');
  const [pincode, setPincode] = useState('');
  const [floorName, setFloorName] = useState('2nd Floor');
  const [shopNumber, setShopNumber] = useState('Shop 204');
  const [section, setSection] = useState('Ethnic & Bridal Wing');
  const [nearbyLandmark, setNearbyLandmark] = useState('Opposite Escalator B');
  const [indoorDirections, setIndoorDirections] = useState('Take the elevator to 2nd floor, turn right past Tanishq.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (shop?.id) {
      api.get(`/shops/${shop.id}`).then((res: any) => {
        const loc = res.data?.location;
        if (loc) {
          setAddress(loc.address || '');
          setCity(loc.city || 'Guwahati');
          setState(loc.state || 'Assam');
          setPincode(loc.pincode || '');
          setFloorName(loc.floorName || '');
          setShopNumber(loc.shopNumber || '');
          setSection(loc.section || '');
          setNearbyLandmark(loc.nearbyLandmark || '');
          setIndoorDirections(loc.indoorDirections || '');
        }
      });
    }
  }, [shop?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop?.id) return;
    setIsSubmitting(true);
    setSuccessMsg('');

    try {
      await api.patch(`/shops/${shop.id}`, {
        address,
        city,
        state,
        pincode,
        floorName,
        shopNumber,
        section,
        nearbyLandmark,
        indoorDirections,
      });

      setSuccessMsg('Shop physical location and mall floor navigation updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update location');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Mall & Physical Floor Navigation"
      subtitle="Accurate floor and shop numbers help customers walk straight into your showroom without getting lost."
    >
      <BrutalCard bg="bg-white" shadow="md" className="p-6">
        {successMsg && (
          <div className="p-3 bg-[#00E599] border-2 border-[#121212] shadow-brutal-sm text-xs font-bold mb-4 flex items-center gap-2">
            <CheckCircle size={18} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Street Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#121212] pb-2 border-b-2 border-[#121212]">
              1. Street Address & City
            </h3>

            <BrutalInput
              label="Street Address / Commercial Complex"
              placeholder="e.g. GS Road, Christian Basti"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <BrutalInput
                label="City"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <BrutalInput
                label="State"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
              />

              <BrutalInput
                label="Pincode"
                placeholder="e.g. 781005"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>
          </div>

          {/* Mall & Indoor Floor Details (Section 13) */}
          <div className="space-y-4 pt-4 border-t-2 border-[#121212]">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#121212] pb-2 border-b-2 border-[#121212]">
              2. Mall / Complex Indoor Navigation (Crucial for In-Person Visits)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <BrutalInput
                label="Floor / Level"
                placeholder="e.g. 2nd Floor, Ground Floor"
                value={floorName}
                onChange={(e) => setFloorName(e.target.value)}
              />

              <BrutalInput
                label="Shop / Unit Number"
                placeholder="e.g. Shop 204, Stall G-12"
                value={shopNumber}
                onChange={(e) => setShopNumber(e.target.value)}
              />

              <BrutalInput
                label="Section / Wing"
                placeholder="e.g. Ethnic & Bridal Wing"
                value={section}
                onChange={(e) => setSection(e.target.value)}
              />
            </div>

            <BrutalInput
              label="Nearby Landmark Inside Mall"
              placeholder="e.g. Near Escalator B, opposite Tanishq showroom"
              value={nearbyLandmark}
              onChange={(e) => setNearbyLandmark(e.target.value)}
              helperText="This helps buyers instantly locate your shop when stepping off the escalator"
            />

            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                Walking Directions For Visitors
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Take central elevator to 2nd floor, turn left past Pantaloons, shop is at the corner..."
                value={indoorDirections}
                onChange={(e) => setIndoorDirections(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#121212] shadow-brutal-sm text-xs font-mono font-medium focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t-3 border-[#121212]">
            <BrutalButton
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
            >
              Save Location & Floor Details
            </BrutalButton>
          </div>
        </form>
      </BrutalCard>
    </DashboardLayout>
  );
};

export default ShopkeeperLocationPage;
