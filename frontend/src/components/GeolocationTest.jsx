import React, { useState, useEffect } from 'react';

const GeolocationComponent = () => {
  const [locationJSON, setLocationJSON] = useState('');
  const [distance, setDistance] = useState(null);
  const [error, setError] = useState(null);

  // Function to geocode an address using Nominatim API
  const geocodeAddress = async (address) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
      } else {
        throw new Error("No results found for the provided address.");
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      throw error;
    }
  };

  // Haversine formula to calculate distance between two coordinates (in km)
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Create a JSON string from the user's latitude and longitude
          const locationData = { latitude, longitude };
          const jsonString = JSON.stringify(locationData);
          setLocationJSON(jsonString);
          console.log("User Location JSON:", jsonString);

          // Define the address to compare with
          const address = "1005 E Main St, Pullman, WA 99163"


          try {
            const addressCoords = await geocodeAddress(address);
            console.log("Address Coordinates:", addressCoords);
            // Calculate the distance between the user and the address
            const calculatedDistance = haversineDistance(
              latitude,
              longitude,
              addressCoords.latitude,
              addressCoords.longitude
            );
            setDistance(calculatedDistance);
            console.log(`Distance to address: ${calculatedDistance.toFixed(2)} km`);
          } catch (err) {
            console.error("Error processing address:", err);
            setError("Error geocoding address or calculating distance:");
          }
        },
        (error) => {
          setError(error.message);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);

  return (
    <div>
      {error ? (
        <p>Error: {error}</p>
      ) : (
        <>
          <p>
            {locationJSON
              ? `User Location JSON: ${locationJSON}`
              : "Fetching user location..."}
          </p>
          <p>
            {distance !== null
              ? `Distance to 185 NE College Ave, Pullman, WA: ${distance.toFixed(2)} km`
              : "Calculating distance..."}
          </p>
        </>
      )}
    </div>
  );
};

export default GeolocationComponent;
