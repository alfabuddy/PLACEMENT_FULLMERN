// In src/components/RideCard.jsx

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, DollarSign, Star, Calendar } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api.js";
import { useState } from "react";
import { Link } from "react-router-dom"; // Import Link for Chat

// Helper function to format date and time
const formatDateTime = (isoString) => {
  const dateObj = new Date(isoString);
  const date = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  return { date, time };
}

const RideCard = ({ ride }) => {
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false); // Can check ride.participants later if needed

  const { date, time } = formatDateTime(ride.startTime);
  const seatsAvailable = ride.maxCapacity - ride.participants.length;

  const handleJoinRide = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/rides/${ride._id}/join`);
      toast.success(data.message || "Ride joined successfully!", {
        description: `You have joined ${ride.creator.name}'s ride.`
      });
      setJoined(true);
      // You might want to update the seatsAvailable count visually here,
      // or rely on a page refresh/re-fetch.
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to join ride");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 shadow-soft hover:shadow-medium transition-all duration-300 border border-border flex flex-col justify-between">
      <div> {/* Wrap content to push buttons to bottom */}
        {/* Route */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground">{ride.startLocation.address}</p>
                <div className="h-8 w-0.5 bg-border ml-2 my-1"></div>
                <p className="font-semibold text-foreground">{ride.endLocation.address}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-accent px-4 py-2 rounded-lg text-center">
            <p className="text-xs text-accent-foreground/80 font-medium">Per Person</p>
            <p className="text-xl font-bold text-accent-foreground">₹{ride.totalFare}</p>
          </div>
        </div>

        {/* DateTime & Seats */}
        <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{date}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{time}</span>
          </div>
        </div>

        {/* Driver Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-semibold">
                {ride.creator.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-medium text-foreground">{ride.creator.name}</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-accent text-accent" />
                  <span className="text-xs text-muted-foreground">4.8</span> {/* Replace with real rating later */}
                </div>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">15 rides</span> {/* Replace with real count later */}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-lg">
            <Users className="w-4 h-4 text-secondary-foreground" />
            <span className="text-sm font-medium text-secondary-foreground">
              {seatsAvailable}/{ride.maxCapacity}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-auto pt-4 flex gap-2"> {/* Use mt-auto to push to bottom */}
          <Button
            onClick={handleJoinRide}
            variant="hero"
            className="flex-1" // Button takes available space
            disabled={loading || joined || seatsAvailable === 0}
          >
            {seatsAvailable === 0 ? "Ride Full" : (joined ? "Joined" : "Request to Join")}
          </Button>
          {/* Add Chat Link/Button */}
          <Link to={`/ride/${ride._id}/chat`} className="flex-1"> {/* Link takes available space */}
             <Button variant="outline" className="w-full">Chat</Button>
          </Link>
      </div>
    </Card>
  );
};

export default RideCard;