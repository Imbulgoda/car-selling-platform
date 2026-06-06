import React from 'react';
import Header from '../layouts/Header';
import { Hero } from '../components/vehicle/Rent_vehicle/Hero';
import { Features } from '../components/vehicle/Rent_vehicle/Features';
import { Process } from '../components/vehicle/Rent_vehicle/Process';
import Footer from '../layouts/Footer';

export function RentVehiclePage() {
  return (
    <div className="min-h-screen w-full bg-white">
      <Header />
      <main>
        <Hero />
        <Features />
        <Process />
      </main>
      <Footer />
    </div>
  );
}
