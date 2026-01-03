import { Card } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { MapPin, Clock, Users, DollarSign, Star, Calendar } from "lucide-react";

import { toast } from "sonner";

import api from "@/lib/api.js";

import { useState, useEffect } from "react";

import { Link } from "react-router-dom";

import { useAuth } from "@/context/AuthContext.jsx";



// Helper function to format date and time (Improved)

const formatDateTime = (isoString) => {

  // 1. Handle null, undefined, or empty string immediately

  if (!isoString) {

    console.warn("formatDateTime received invalid input:", isoString);

    return { date: 'N/A', time: 'N/A' };

  }

  try {

    const dateObj = new Date(isoString);

    // 2. Check if the created date object is valid

    if (isNaN(dateObj.getTime())) {

      console.error("Invalid date string passed to formatDateTime:", isoString);

      return { date: 'Invalid Date', time: 'Invalid Time' };

    }

    // 3. If valid, format and return

    const date = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const time = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    return { date, time };

  } catch (e) {

    console.error("Error formatting date:", e, "Input:", isoString);

    return { date: 'Error', time: 'Error' };

  }

};



const RideCard = ({ ride }) => {

  const { user } = useAuth();

  const [loading, setLoading] = useState(false);

  const [isParticipant, setIsParticipant] = useState(false);



  useEffect(() => {

    if (user && ride?.participants) {

      // Check if participants array contains objects with _id or just strings

      const alreadyJoined = ride.participants.some(p => p === user._id || p?._id === user._id);

      setIsParticipant(alreadyJoined);

    } else {

      setIsParticipant(false);

    }

  }, [ride, user]);



  const { date, time } = formatDateTime(ride?.startTime);

  const seatsAvailable = (ride?.maxCapacity ?? 0) - (ride?.participants?.length ?? 0);

  const creatorName = ride?.creator?.name ?? 'Unknown';

  const isCreator = user && (ride?.creator === user._id || ride?.creator?._id === user._id);



  // --- ADDED: Get participant names ---

  // Ensure participants is an array and handle both populated and non-populated cases

  const participantNames = Array.isArray(ride?.participants)

      ? ride.participants

          .map(p => p?.name) // Get name if participant is populated object

          .filter(name => name && name !== creatorName) // Filter out null/undefined names and the creator

      : []; // Default to empty array

  // ------------------------------------





  const handleJoinRide = async () => {

    if (isParticipant || isCreator) return;

    setLoading(true);

    try {

      const { data } = await api.post(`/rides/${ride._id}/join`);

      toast.success(data.message || "Ride joined successfully!", {

        description: `You have joined ${creatorName}'s ride.`

      });

      setIsParticipant(true);

      // Ideally, you'd refresh the whole ride list here or update participantNames state

    } catch (error) {

      console.error("Join ride error:", error.response || error);

      toast.error(error.response?.data?.message || "Failed to join ride");

    } finally {

      setLoading(false);

    }

  };



  let joinButtonText = "Request to Join";

  let joinButtonDisabled = loading || seatsAvailable <= 0;



  if (isCreator) {

    joinButtonText = "Your Ride";

    joinButtonDisabled = true;

  } else if (isParticipant) {

    joinButtonText = "Joined";

    joinButtonDisabled = true;

  } else if (seatsAvailable <= 0) {

    joinButtonText = "Ride Full";

    joinButtonDisabled = true;

  }



  return (

    <Card className="p-6 shadow-soft hover:shadow-medium transition-all duration-300 border border-border flex flex-col justify-between">

      <div> {/* Content wrapper */}

        {/* Route */}

        <div className="flex items-start gap-4 mb-4">

          <div className="flex-1"> {/* Route details */}

             <div className="flex items-center gap-2 mb-1">

                 <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />

                 <p className="font-semibold text-foreground">{ride?.startLocation?.address ?? 'N/A'}</p>

             </div>

             <div className="h-6 w-0.5 bg-border ml-[9px] my-0.5"></div> {/* Vertical line */}

             <div className="flex items-center gap-2 mt-1">

                 <MapPin className="w-5 h-5 text-accent flex-shrink-0 mb-1"/>

                 <p className="font-semibold text-foreground">{ride?.endLocation?.address ?? 'N/A'}</p>

             </div>

          </div>

          {/* Cost Badge */}

          <div className="bg-gradient-accent px-4 py-2 rounded-lg text-center flex-shrink-0"> {/* Adjusted badge */}

            <p className="text-xs text-accent-foreground/80 font-medium">Per Person</p>

            <p className="text-xl font-bold text-accent-foreground">₹{ride?.totalFare ?? 'N/A'}</p>

          </div>

        </div>



        {/* DateTime */}

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



        {/* Creator Info & Seats */}

        <div className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-3"> {/* Creator Info */}

            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">

              <span className="text-primary-foreground font-semibold">

                {creatorName.charAt(0)}

              </span>

            </div>

            <div>

              <p className="font-medium text-foreground">{creatorName}</p>

              <div className="flex items-center gap-2">

                {/* Static rating/rides for now */}

                <div className="flex items-center gap-1">

                  <Star className="w-3 h-3 fill-accent text-accent" />

                  <span className="text-xs text-muted-foreground">4.8</span>

                </div>

                <span className="text-xs text-muted-foreground">•</span>

                <span className="text-xs text-muted-foreground">15 rides</span>

              </div>

            </div>

          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-lg flex-shrink-0"> {/* Seats */}

            <Users className="w-4 h-4 text-secondary-foreground" />

            <span className="text-sm font-medium text-secondary-foreground">

              {seatsAvailable < 0 ? 0 : seatsAvailable}/{ride?.maxCapacity ?? '?'} Left

            </span>

          </div>

        </div>



        {/* --- ADDED: Display Participants --- */}

        {participantNames.length > 0 && (

          <div className="mb-4 pt-4 border-t border-border">

            <h4 className="text-sm font-medium text-muted-foreground mb-2">Joined By:</h4>

            <div className="flex flex-wrap gap-1.5"> {/* Smaller gap */}

              {participantNames.map((name, index) => (

                <span key={index} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full"> {/* Rounded pill */}

                  {name}

                </span>

              ))}

            </div>

          </div>

        )}

        {/* ---------------------------------- */}



      </div> {/* End Content wrapper */}



      {/* Action Buttons */}

      <div className="mt-auto pt-4 flex gap-2"> {/* Buttons container */}

          <Button

            onClick={handleJoinRide}

            variant="hero"

            className="flex-1"

            disabled={joinButtonDisabled}

          >

            {loading ? "Processing..." : joinButtonText}

          </Button>



          {/* --- UPDATED: Chat Link (Always visible if logged in) --- */}

          <Link to={`/ride/${ride._id}/chat`} className="flex-1">

             <Button variant="outline" className="w-full">Chat</Button>

          </Link>

          {/* -------------------------------------------------------- */}

      </div>

    </Card>

  );

};

export default RideCard