import React from 'react';
import Head from 'next/head';
import { Car, Settings, Heart, Bell } from 'lucide-react';

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Dashboard | Drive Deal</title>
        <meta name="description" content="Manage your Drive Deal account and view your activity" />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Car className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold">My Listings</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300">You have no active listings</p>
            <a href="/sell" className="text-primary hover:underline mt-4 inline-block">Create a listing</a>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Heart className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold">Favorites</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300">You have 0 saved cars</p>
            <a href="/favorites" className="text-primary hover:underline mt-4 inline-block">View favorites</a>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Bell className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold">Alerts</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300">You have 0 active alerts</p>
            <a href="/alerts" className="text-primary hover:underline mt-4 inline-block">Manage alerts</a>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Settings className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold">Settings</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300">Update your profile and preferences</p>
            <a href="/settings" className="text-primary hover:underline mt-4 inline-block">View settings</a>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="text-gray-600 dark:text-gray-300 text-center py-8">
            <p>No recent activity to display</p>
          </div>
        </div>
      </div>
    </>
  );
} 
