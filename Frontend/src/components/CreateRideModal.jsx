import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// --- IMPORT LocateFixed ICON ---
import { MapPin, Clock, Users, DollarSign, Calendar, LocateFixed } from "lucide-react"; 
import { toast } from "sonner";
import api from "@/lib/api.js";

const CreateRideModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    date: "",
    time: "",
    seats: "",
    cost: "",
    startLat: null, // <-- ADDED
    startLng: null, // <-- ADDED
  });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false); // <-- ADDED

  // --- ADDED: Function to get user's current location ---
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          from: "My Current Location", // Set text field
          startLat: latitude,         // Save lat
          startLng: longitude,        // Save lng
        }));
        setLocationLoading(false);
        toast.success("Location captured!");
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error(`Error getting location: ${error.message}`);
        setLocationLoading(false);
      }
    );
  };
  // --- END ADD ---

  const handleSubmit = async () => {
    setLoading(true);

    // Destructure all data, including new lat/lng
    const { from, to, date, time, seats, cost, startLat, startLng } = formData;

    if (!from || !to || !date || !time || !seats || !cost) {
      toast.error("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Check: If 'from' is set to "My Current Location", ensure we have coordinates
    if (from === "My Current Location" && (!startLat || !startLng)) {
       toast.error("Location coordinates are missing. Please try 'Use My Location' again.");
       setLoading(false);
       return;
    }
    
    try {
      // Send all form data, including new coordinates
      // The backend will receive { from, to, ..., startLat, startLng }
      await api.post("/rides", formData); 

      toast.success("Ride created successfully!", {
        description:
          "Your ride has been posted and is now visible to other students.",
      });

      // Reset form (including new fields)
      setFormData({
        from: "",
        to: "",
        date: "",
        time: "",
        seats: "",
        cost: "",
        startLat: null,
        startLng: null,
      });

      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create ride");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Create New Ride</DialogTitle>
        </DialogHeader>

        {/* Input Fields */}
        <div className="flex flex-col gap-4 mt-4">
          {/* From */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <MapPin className="w-4 h-4 text-blue-600" />
              From
            </label>
            {/* --- UPDATED INPUT GROUP --- */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter pickup location"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={formData.from}
                // If user types manually, clear the saved coordinates
                onChange={(e) =>
                  setFormData({ ...formData, from: e.target.value, startLat: null, startLng: null })
                }
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleGetLocation}
                disabled={locationLoading}
                className="shrink-0"
                aria-label="Use my current location"
              >
                {locationLoading ? 
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div> :
                  <LocateFixed className="w-4 h-4" />
                }
              </Button>
            </div>
            {/* --- END UPDATED INPUT GROUP --- */}
          </div>

          {/* To */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <MapPin className="w-4 h-4 text-purple-600" />
              To
            </label>
            <input
              type="text"
              placeholder="Enter destination"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={formData.to}
              onChange={(e) =>
                setFormData({ ...formData, to: e.target.value })
              }
            />
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4 text-green-600" />
                Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>

            {/* Time */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Clock className="w-4 h-4 text-orange-600" />
                Time
              </label>
              <input
                type="time"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
              />
            </div>
          </div>

          {/* Seats and Cost Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Seats */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Users className="w-4 h-4 text-blue-600" />
                Seats
              </label>
              <input
                type="number"
                min="1"
                max="10"
                placeholder="Available seats"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={formData.seats}
                onChange={(e) =>
                  setFormData({ ...formData, seats: e.target.value })
                }
              />
            </div>

            {/* Cost */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <DollarSign className="w-4 h-4 text-green-600" />
                Cost (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Cost per person"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={formData.cost}
                onChange={(e) =>
                  setFormData({ ...formData, cost: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {loading ? "Creating..." : "Create Ride"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRideModal;