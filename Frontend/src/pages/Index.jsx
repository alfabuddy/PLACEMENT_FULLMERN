import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Users,
  DollarSign,
  Shield,
  ArrowRight,
  Star,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 🔥 Central handler for all CTA buttons
  const handleAction = (loggedInPath = "/dashboard") => {
    if (user) {
      navigate(loggedInPath);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* ================= HERO ================= */}
      <header className="relative overflow-hidden">
        <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
          {/* LOGO */}
          <div
            onClick={() => handleAction("/dashboard")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              RideShare
            </span>
          </div>

          {/* NAV BUTTONS */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => handleAction("/dashboard")}>
              Find Rides
            </Button>
            <Button variant="hero" onClick={() => handleAction("/dashboard")}>
              Get Started
            </Button>
          </div>
        </nav>

        {/* HERO CONTENT */}
        <div className="container mx-auto px-4 py-20 md:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Split College Rides,
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {" "}
              Save Money
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Connect with fellow students to share auto and cab rides. Split
            costs, reduce expenses, and travel together safely.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="hero"
              size="lg"
              onClick={() => handleAction("/dashboard")}
              className="w-full sm:w-auto"
            >
              Find a Ride
              <ArrowRight className="w-5 h-5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => handleAction("/dashboard")}
              className="w-full sm:w-auto"
            >
              Offer a Ride
            </Button>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div>
              <p className="text-3xl md:text-4xl font-bold">500+</p>
              <p className="text-sm text-muted-foreground mt-1">Students</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold">₹450</p>
              <p className="text-sm text-muted-foreground mt-1">Avg. Savings</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold">1200+</p>
              <p className="text-sm text-muted-foreground mt-1">Rides Shared</p>
            </div>
          </div>
        </div>
      </header>

      {/* ================= FEATURES ================= */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose RideShare?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The smartest way for college students to share rides and split costs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-8">
            <DollarSign className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Save Money</h3>
            <p className="text-muted-foreground">
              Split fares with fellow students and save on every commute.
            </p>
          </Card>

          <Card className="p-8">
            <Users className="w-10 h-10 text-accent mb-4" />
            <h3 className="text-xl font-semibold mb-2">Build Community</h3>
            <p className="text-muted-foreground">
              Travel together and connect with students from your campus.
            </p>
          </Card>

          <Card className="p-8">
            <Shield className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Safe & Verified</h3>
            <p className="text-muted-foreground">
              Only verified users can join rides.
            </p>
          </Card>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            What Students Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[1, 2].map((i) => (
            <Card key={i} className="p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, idx) => (
                  <Star
                    key={idx}
                    className="w-5 h-5 fill-accent text-accent"
                  />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                RideShare helped me save money and meet amazing people!
              </p>
              <p className="font-semibold">College Student</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-primary p-12 text-center border-0">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Start Saving?
          </h2>
          <Button
            variant="accent"
            size="lg"
            onClick={() => handleAction("/dashboard")}
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Card>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-border py-8 text-center">
        <p className="text-sm text-muted-foreground">
          © 2025 RideShare. Making college commutes affordable.
        </p>
      </footer>
    </div>
  );
};

export default Index;
