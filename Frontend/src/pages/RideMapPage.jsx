// src/pages/RideMapPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import io from 'socket.io-client';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { ChevronLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- Custom Marker Icons ---
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Green marker for current user (You)
const greenIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Red marker for ride owner
const redIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Blue marker for other passengers
const blueIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Set default icon
L.Marker.prototype.options.icon = blueIcon;
// --- END Custom Icons ---


const RideMapPage = () => {
  const { rideId } = useParams();
  const { user: currentUser } = useAuth();
  const [participants, setParticipants] = useState({});
  const [rideOwnerId, setRideOwnerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  
  const socketRef = useRef(null);

  // 1. Fetch ride details to get the owner
  useEffect(() => {
    const fetchRideDetails = async () => {
      try {
        const { data } = await api.get(`/rides/${rideId}`);
        // Handle both populated and non-populated createdBy
        const ownerId = typeof data.createdBy === 'object' ? data.createdBy._id : data.createdBy;
        setRideOwnerId(ownerId);
        console.log('Ride Owner ID:', ownerId); // Debug log
        console.log('Current User ID:', currentUser._id); // Debug log
      } catch (error) {
        console.error("Failed to fetch ride details", error);
        toast.error("Failed to load ride details.");
      }
    };
    fetchRideDetails();
  }, [rideId, currentUser._id]);

  // 2. Fetch initial locations
  useEffect(() => {
    const fetchInitialLocations = async () => {
      try {
        const { data } = await api.get(`/rides/${rideId}/locations`);
        
        const initialParticipants = {};
        data.forEach(p => {
          if (p.location.lat !== 0 || p.location.lng !== 0) {
            initialParticipants[p.userId] = {
              userName: p.userName,
              location: p.location,
            };
          }
        });
        
        setParticipants(initialParticipants);

        const myLocation = initialParticipants[currentUser._id]?.location;
        if (myLocation) {
          setMapCenter([myLocation.lat, myLocation.lng]);
          setMapZoom(14);
        } else if (data.length > 0 && (data[0].location.lat !== 0 || data[0].location.lng !== 0)) {
          setMapCenter([data[0].location.lat, data[0].location.lng]);
          setMapZoom(14);
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch locations", error);
        toast.error("Failed to load ride locations.");
        setLoading(false);
      }
    };
    fetchInitialLocations();
  }, [rideId, currentUser._id]);

  // 3. Setup Socket.IO connection and listeners
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001');
    socketRef.current = socket;

    socket.emit('join_ride_chat', rideId);

    socket.on('location_updated', (data) => {
      setParticipants(prev => ({
        ...prev,
        [data.userId]: {
          userName: data.userName,
          location: data.location,
        },
      }));
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      toast.error('Real-time connection failed.');
    });

    return () => {
      socket.disconnect();
    };
  }, [rideId]);

  // 4. Start sending my location
  useEffect(() => {
    if (!navigator.geolocation || !socketRef.current) {
      toast.info("Geolocation is not supported by your browser or socket is not connected.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const myLocation = { lat: latitude, lng: longitude };

        socketRef.current.emit('update_location', {
          rideId,
          userId: currentUser._id,
          userName: currentUser.name,
          location: myLocation,
        });

        setParticipants(prev => ({
          ...prev,
          [currentUser._id]: {
            userName: currentUser.name,
            location: myLocation,
          },
        }));
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Could not get your location. " + error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };

  }, [rideId, currentUser._id, currentUser.name]);

  // Helper function to determine marker icon
  const getMarkerIcon = (userId) => {
    if (userId === currentUser._id) {
      return greenIcon; // You are green
    } else if (userId === rideOwnerId) {
      return redIcon; // Owner is red
    } else {
      return blueIcon; // Others are blue
    }
  };

  // Helper function to get label
  const getMarkerLabel = (userId) => {
    if (userId === currentUser._id) {
      return "You";
    } else if (userId === rideOwnerId) {
      return "Driver (Owner)";
    } else {
      return "Passenger";
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-card border-b border-border z-10 shadow-soft p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/my-rides" className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-xl font-bold">Live Ride Map</h1>
          </Link>
          <div className="flex items-center gap-2 text-primary">
            <Users className="w-5 h-5" />
            <span className="font-medium">{Object.keys(participants).length}</span>
          </div>
        </div>
      </header>
      
      {/* Map Legend */}
      <div className="bg-card border-b border-border px-4 py-2 z-10">
        <div className="container mx-auto flex items-center gap-6 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
            <span className="font-medium">You</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow"></div>
            <span className="font-medium">Driver (Owner)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"></div>
            <span className="font-medium">Other Passengers</span>
          </div>
        </div>
      </div>
      
      {/* Map */}
      <div className="flex-1 w-full z-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading map...</p>
          </div>
        ) : (
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Map over participants with color-coded markers */}
            {Object.entries(participants).map(([userId, data]) => {
              const markerIcon = getMarkerIcon(userId);
              const markerLabel = getMarkerLabel(userId);
              
              return (
                <Marker 
                  key={userId} 
                  position={[data.location.lat, data.location.lng]}
                  icon={markerIcon}
                >
                  <Tooltip direction="top" offset={[0, -40]} opacity={0.9} permanent>
                    <div className="font-semibold text-xs">
                      {data.userName}
                      {userId === currentUser._id && " (You)"}
                    </div>
                  </Tooltip>
                  <Popup>
                    <div className="font-medium text-base">
                      {data.userName}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {markerLabel}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Lat: {data.location.lat.toFixed(5)}, Lng: {data.location.lng.toFixed(5)}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default RideMapPage;