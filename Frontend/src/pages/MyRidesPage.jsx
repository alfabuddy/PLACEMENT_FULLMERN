// src/pages/MyRidesPage.jsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Users, Map, CreditCard, Wallet, MessageCircle } from "lucide-react";
import RideCard from "@/components/RideCard.jsx";
import { Button } from "@/components/ui/button";
import api from "@/lib/api.js";
import { useAuth } from "@/context/AuthContext.jsx";
import { toast } from "sonner";
import { loadRazorpay } from "@/lib/razorpay";

const MyRidesPage = () => {
  const [myRides, setMyRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMyRides = async () => {
    try {
      const { data } = await api.get("/rides/myrides");
      setMyRides(data);
    } catch {
      toast.error("Failed to fetch rides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchMyRides();
  }, [user]);

  const handleCompleteRide = async (rideId) => {
    await api.patch(`/rides/${rideId}/complete`);
    fetchMyRides();
  };

  // ===== PAYMENT HELPERS =====

  const hasUserPaid = (ride) =>
    ride.payments?.some((p) => p.user === user._id && p.paid);

  const allParticipantsPaid = (ride) => {
    const totalToPay = ride.participants.length - 1; // exclude creator
    const paidCount = ride.payments?.filter((p) => p.paid).length || 0;
    return paidCount === totalToPay;
  };

  // ===== ONLINE PAYMENT =====

  const handleOnlinePayment = async (rideId) => {
    await loadRazorpay();
    const { data: order } = await api.post("/payment/create-order", { rideId });

    new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY,
      order_id: order.id,
      amount: order.amount,
      currency: "INR",
      handler: async (res) => {
        await api.post("/payment/verify", {
          rideId,
          order_id: order.id,
          payment_id: res.razorpay_payment_id,
          signature: res.razorpay_signature,
        });
        toast.success("Payment successful 🎉");
        fetchMyRides();
      },
    }).open();
  };

  // ===== CASH PAYMENT =====

  const handleCashPayment = async (rideId) => {
    await api.post("/payment/cash", { rideId });
    toast.success("Cash payment marked");
    fetchMyRides();
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b p-4 flex justify-between">
        <Link to="/dashboard" className="flex gap-2 items-center">
          <Users />
          <span className="font-bold">RideShare</span>
        </Link>
      </header>

      {/* Content */}
      <main className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <p className="lg:col-span-2 text-center text-muted-foreground">
            Loading your rides...
          </p>
        ) : (
          myRides.map((ride) => {
            const isCreator = ride.creator._id === user._id;
            const userPaid = hasUserPaid(ride);

            return (
              <div key={ride._id}>
                <RideCard ride={ride} />

                {/* 🔹 ALWAYS AVAILABLE ACTIONS */}
                <div className="flex gap-2 mt-2">
                  {/* Chat – ALWAYS visible */}
                  <Link to={`/ride/${ride._id}/chat`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                  </Link>

                  {/* Live Map – only pending / active */}
                  {(ride.status === "pending" || ride.status === "active") && (
                    <Link to={`/ride/${ride._id}/map`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Map className="w-4 h-4 mr-2" />
                        Live Map
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Creator – complete ride */}
                {(ride.status === "pending" || ride.status === "active") &&
                  isCreator && (
                    <Button
                      className="w-full mt-2"
                      onClick={() => handleCompleteRide(ride._id)}
                    >
                      Mark as Complete
                    </Button>
                  )}

                {/* PAYMENT SECTION (Participants only) */}
                {ride.status === "completed" && !isCreator && (
                  <Card className="mt-3 p-4 space-y-3 border-dashed">
                    {userPaid ? (
                      <Button disabled className="w-full">
                        ✅ Payment Done
                      </Button>
                    ) : (
                      <>
                        <Button
                          className="w-full flex gap-2"
                          onClick={() => handleOnlinePayment(ride._id)}
                        >
                          <CreditCard size={18} />
                          Pay Online (UPI / Card)
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full flex gap-2"
                          onClick={() => handleCashPayment(ride._id)}
                        >
                          <Wallet size={18} />
                          Pay Cash to Owner
                        </Button>
                      </>
                    )}
                  </Card>
                )}

                {/* OWNER PAYMENT STATUS */}
                {ride.status === "completed" && isCreator && (
                  <div className="mt-3 text-center text-sm">
                    {allParticipantsPaid(ride) ? (
                      <span className="text-green-600 font-semibold">
                        ✅ All participants have paid
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Waiting for participants to complete payment
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>
    </div>
  );
};

export default MyRidesPage;
