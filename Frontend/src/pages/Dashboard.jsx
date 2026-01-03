import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, MapPin, Users, DollarSign } from "lucide-react";
import CreateRideModal from "@/components/CreateRideModal.jsx";
import RideCard from "@/components/RideCard.jsx";
import api from "@/lib/api.js";
import { useAuth } from "@/context/AuthContext.jsx";
import { toast } from "sonner";

const Dashboard = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Stats state
  const [stats, setStats] = useState({
    availableRides: 0,
    avgSaved: 450,
    activeUsers: 156
  });

  const fetchRides = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/rides');
      setRides(data);
      // Update stats based on real data
      setStats(prev => ({ ...prev, availableRides: data.length }));
    } catch (error) {
      console.error("Failed to fetch rides", error);
      toast.error("Failed to fetch rides. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch rides when the component loads or user changes
  useEffect(() => {
    if (user) {
      fetchRides();
    }
  }, [user]);

  // Handler for when a ride is successfully created
  const handleRideCreated = () => {
    setIsCreateModalOpen(false);
    fetchRides(); // Refresh list to show the new ride
    toast.success("Ride created successfully!");
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                RideShare
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className="text-foreground font-medium hover:text-primary transition-colors">
                Find Rides
              </Link>
              <Link to="/my-rides" className="text-muted-foreground hover:text-foreground transition-colors">
                My Rides
              </Link>
              <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
                Profile
              </Link>
            </nav>

            <Button onClick={() => setIsCreateModalOpen(true)} variant="hero">
              <Plus className="w-4 h-4" />
              Create Ride
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 shadow-soft hover:shadow-medium transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.availableRides}</p>
                <p className="text-sm text-muted-foreground">Available Rides</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-soft hover:shadow-medium transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">₹{stats.avgSaved}</p>
                <p className="text-sm text-muted-foreground">Avg. Saved</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-soft hover:shadow-medium transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.activeUsers}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Available Rides List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Available Rides</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : rides.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rides available</h3>
              <p className="text-gray-500 mb-6">Be the first to create a ride!</p>
              <Button onClick={() => setIsCreateModalOpen(true)} variant="outline">
                Create Ride
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rides.map((ride) => (
                <RideCard key={ride._id} ride={ride} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Ride Modal */}
      <CreateRideModal 
        isOpen={isCreateModalOpen} 
        onClose={closeCreateModal}
        onSuccess={handleRideCreated} 
      />
    </div>
  );
};

export default Dashboard;